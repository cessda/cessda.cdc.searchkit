import Sitemapper from 'sitemapper';
import axios from 'axios';
import winston from 'winston';
import { URL } from 'url';
import { Storage } from '@google-cloud/storage';
//import fs from 'fs';

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

// Create a client with explicit credentials
const storage = new Storage({
    projectId: 'cessda-dev',
    keyFilename: '/path/to/keyfile.json'
});

const bucketName = 'cessda-fuji-storage-dev';
//storage.getBuckets().then(x => console.log(x));
//throw new Error("controlled termination");
// Get a reference to the bucket
const storageBucket = storage.bucket(bucketName);

function fujiMetrics() {
    (async () => {
        const cdcLinks = new Sitemapper({
            url: 'https://datacatalogue.cessda.eu/sitemap_index.xml',
            timeout: 15000, // 15 seconds
            debug: true,
            retries: 1,
        });
        try {
            const { sites } = await cdcLinks.fetch();
            sites.shift(); //remove 1st element - https://datacatalogue.cessda.eu/
            logger.info(`Acessing: ${sites.length}`, 'sites');
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

async function apiLoop(link: string): Promise<string>{

    const urlLink = new URL(link); 
    const urlParams = urlLink.searchParams;
    const fileName = urlParams.get('q')+"-"+urlParams.get('lang')+".json";
    logger.info(fileName);
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
        const output = res.data;
        
        async function uploadFromMemory() {
            await storage.bucket(bucketName).file(fileName).save(output);
        
            console.log(
              `${fileName} with contents ${output} uploaded to ${bucketName}.`
            );
          }
        
          uploadFromMemory().catch(console.error);
        
        //Write-to-file-Code
        /*fs.writeFile(`fujiResults/${fileName}.json`, JSON.stringify(output, null, 4).toString(), (err) => {
            if (err)
              logger.error(`Error writing to file: ${err}`);
            else {
              logger.info("File written successfully\n");
            }
          });*/
    })
    .catch((error: any) => {
        console.error(`Error at FuJI API: ${error}`)
        logger.error(`Error at FuJI API: ${error}`);
    })

    return new Promise(function(resolve) {
        setTimeout(() => {
            resolve("completed")
          }, 2000); //delay between API calls
    });

}

fujiMetrics();