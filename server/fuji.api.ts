import Sitemapper from 'sitemapper';
import axios from 'axios';
import winston from 'winston';
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
            console.log(`Acessing: ${sites.length}`, 'sites');
            console.log(sites[1]);
            let counter = 0;
            sites.forEach(async function (value, key) {
            //console.log(`value: ${value}`);
            await axios
                .post('http://localhost:1071/fuji/api/v1/evaluate', {
                    "metadata_service_endpoint": "",
                    //"metadata_service_type": sites[1],
                    "metadata_service_type": value,
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
                    console.log(`statusCode: ${res.status}`)
                    console.log(res.data)
                    const output = res.data;
                    fs.writeFile('fujiResults/'+counter+'.txt', JSON.stringify(output, null, 4).toString(), err =>{
                        if (err){
                            console.log(err)
                            return;
                        }
                    })
                    counter++;
                })
                .catch((error: any) => {
                    console.error(`Error at FuJI API: ${error}`)
                    logger.error(`Error at FuJI API: ${error}`);
                })
            });
        } catch (error) {
            console.log(`Error at crawling indexer: ${error}`);
            logger.error(`Error at crawling indexer: ${error}`);
        } finally {
            logger.info('Finished Request');
        }
        logger.info('End');
    })();
}

fujiMetrics();