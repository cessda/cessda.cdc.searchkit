import Sitemapper from 'sitemapper';
import axios from 'axios';
import winston from 'winston';
import fs from 'fs';
import { URLSearchParams, URL } from 'url';

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
            console.log(`Acessing: ${sites.length}`, 'sites');
            logger.info(`Acessing: ${sites.length}`, 'sites');
            for (const site of sites) {
                const contents = await apiLoop(site);
                //console.log(contents);
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
    const urlParams = new URLSearchParams(link);
    logger.info(`site: ${urlLink}`);
    //needs to be changed - sitemaps links
    const valueArr: Array<String> = [];
    urlParams.forEach(function(key, value) {
        valueArr.push(value)
    });
    //to create the file name with allowed chars
    const fileName = valueArr[1].replace(/quot;/g, "").replace(/:/g, ".").replace(/\//g, "-");
    await axios
    .post('http://localhost:1071/fuji/api/v1/evaluate', {
        "metadata_service_endpoint": "",
        "metadata_service_type": urlLink,
        "object_identifier": "value",
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
        fs.writeFile(`fujiResults/${fileName}.txt`, JSON.stringify(output, null, 4).toString(), (err) => {
            if (err)
              logger.error(`Error writing to file: ${err}`);
            else {
              logger.info("File written successfully\n");
            }
          });
    })
    .catch((error: any) => {
        console.error(`Error at FuJI API: ${error}`)
        logger.error(`Error at FuJI API: ${error}`);
    })

    return new Promise(function(resolve) {
        setTimeout(() => {
            resolve("completed")
          }, 1000);
    });

}

fujiMetrics();