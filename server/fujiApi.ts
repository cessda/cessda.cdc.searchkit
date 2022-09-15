import Sitemapper from 'sitemapper';
import axios from 'axios';
import winston from 'winston';
import { URL } from 'url';
import { Storage } from '@google-cloud/storage';
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
import fs from 'fs';

const logLevel = process.env.SEARCHKIT_LOG_LEVEL || 'info';
function loggerFormat() {
    if (process.env.SEARCHKIT_USE_JSON_LOGGING === 'true') {
        return winston.format.json();
    } else {
        return winston.format.printf(
            ({ level, message, timestamp }) => `[${timestamp}][${level}] ${message}`
        );
    }
}

// Logger
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        loggerFormat()
    ),
    transports: [
        new winston.transports.Console()
    ],
    exceptionHandlers: [
        new winston.transports.Console()
    ],
});

// Elasticsearch Client - Defaults to localhost if unspecified
const elasticsearchUrl = process.env.PASC_ELASTICSEARCH_URL || "http://localhost:9200/";
const elasticsearchUsername = process.env.SEARCHKIT_ELASTICSEARCH_USERNAME;
const elasticsearchPassword = process.env.SEARCHKIT_ELASTICSEARCH_PASSWORD;
const debugEnabled = process.env.PASC_DEBUG_MODE === 'true';

const client = elasticsearchUsername && elasticsearchPassword ? new Client({
  node: elasticsearchUrl,
  auth: {
    username: elasticsearchUsername,
    password: elasticsearchPassword
  }})
  : new Client({
      node: elasticsearchUrl,
  })

// Create a google client with explicit credentials - jsonFile
/*const storage = new Storage({
    projectId: 'cessda-dev',
    keyFilename: '/path/to/keyfile.json'
});*/
// Create a google client with explicit credentials - ENV
/*const storage = new Storage({
  projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
  credentials: {
    client_email: process.env.GOOGLE_STORAGE_EMAIL,
    private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY,
  }
});*/

const storage = new Storage(); //localhost test auth
const bucketName = 'cessda-fuji-storage-dev';

function fujiMetrics() {

  (async () => {
      const cdcLinks = new Sitemapper({
          url: 'https://datacatalogue.cessda.eu/sitemap_index.xml',
          timeout: 15000, // 15 seconds
          debug: true,
          retries: 1,
      });
      try {
          await elasticIndexRebuild();
          const { sites } = await cdcLinks.fetch();
          sites.shift(); //remove 1st element - https://datacatalogue.cessda.eu/
          logger.info(`Links Collected: ${sites.length}`);
          for (const site of sites) {
              const contents = await apiLoop(site);
          }
      } catch (error) {
          console.log(`Error at crawling indexer: ${error}`);
          logger.error(`Error at crawling indexer: ${error}`);
      } finally {
          logger.info('Finished Request');
      }
      logger.info('End');
  })();
}

async function elasticIndexRebuild(){

   const {body: exists} = await client.indices.exists({index: 'fuji-results'})
   if (exists){
    await client.indices.delete({ index: 'fuji-results' });
    logger.info('ES Index Deleted');
   }
   await client.indices.create({
    index: 'fuji-results',
    body: {
      mappings: {
        dynamic: 'runtime',
        properties: {
          id: {type: 'keyword'},
          body: {type: 'object'}
        }
      }
    }
   })
   logger.info('ES Index Created');
}

async function apiLoop(link: string): Promise<string>{

    const urlLink = new URL(link); 
    const urlParams = urlLink.searchParams;
    const fileName = urlParams.get('q')+"-"+urlParams.get('lang')+".json";
    logger.info(`\n`);
    logger.info(`Name: ${fileName}`);
    fetch('https://datacatalogue.cessda.eu/api/json/cmmstudy_'+urlParams.get('lang')+'/'+urlParams.get('q')).then((response) => 
    {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      response.json()
    })
    .then((data) => logger.info(`Name: ${data}`))
    .catch((error) => {
      logger.error(`Error at CDC fetch operation: ${error}`);
    });
    await axios
    .post('http://localhost:1071/fuji/api/v1/evaluate', {
        "metadata_service_endpoint": "",
        "metadata_service_type": "",
        "object_identifier": link,
        "test_debug": true,
        "use_datacite": true
    }, {
        auth: {
            username: "marvel",
            password: "wonderwoman"
        }
    })
    .then((res: { status: any; data: any; }) => {
        logger.info(`statusCode: ${res.status}`);
        const fujiResults = res.data;
        delete fujiResults['results'];

        resultsToElastic(fileName, fujiResults).then(()=>{
          //resultsToHDD(fileName, fujiResults); //Write-to-HDD-localhost function
          //uploadFromMemory(fileName, fujiResults).catch(console.error); //Write-to-Cloud-Bucket function
        })

    })
    .catch((error: any) => {
        console.error(`Error at FuJI API: ${error}`)
        logger.error(`Error at FuJI API: ${error}`);
    })

    return new Promise(function(resolve) {
      setTimeout(() => {
          resolve("completed")
        }, 1000); //1sec delay between API calls
  });

}

async function resultsToElastic (fileName: string, fujiResults: JSON) {

  try{
    const elasticdoc: RequestParams.Index = {
      index: 'fuji-results',
      id: fileName,
      body: {
        fujiResults
      }
    }
    await client.index(elasticdoc)
    await client.indices.refresh({ index: 'fuji-results' })
    logger.info(`inserted in ES: ${fileName}`);
  }
  catch(error){
    logger.error(`error in insert to ES: ${error}`);
  }

}

async function uploadFromMemory(fileName: string, fujiResults: Buffer) {
  /* DEBUG CODE
  const storageBucket = storage.bucket(bucketName);
  storage.getBuckets().then(x => console.log(x));
  throw new Error("controlled termination");
  */

  await storage.bucket(bucketName).file(fileName).save(Buffer.from(JSON.stringify(fujiResults)));    
  logger.info(
    `${fileName} with contents uploaded to ${bucketName}.`
  );
}

function resultsToHDD(fileName: string, fujiResults: JSON){
  
  fs.writeFile(`fujiResults/${fileName}`, JSON.stringify(fujiResults, null, 4).toString(), (err) => {
    if (err)
      logger.error(`Error writing to file: ${err}`);
    else {
      logger.info("File written successfully");
    }
  });
}

fujiMetrics();