// Copyright CESSDA ERIC 2017-2021
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import proxy from 'express-http-proxy';
import express, { RequestHandler } from 'express';
import request, { CoreOptions } from 'request';
import bodybuilder, { Bodybuilder } from 'bodybuilder';
import bodyParser from 'body-parser';
import compression from 'compression';
import methodOverride from 'method-override';
import { ParsedQs } from 'qs';
import responseTime from 'response-time';
import { CMMStudy, getJsonLd, getStudyModel } from '../common/metadata';
import { startMetricsListening, apiResponseTimeHandler, uiResponseTimeHandler, uiResponseTimeTotalFailedHistogram, uiResponseTimeZeroElasticResultsHistogram } from './metrics';
import Elasticsearch from './elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/api/types';
import { ConnectionError, ResponseError } from '@elastic/elasticsearch/lib/errors';
import { Response } from 'express-serve-static-core';
import { logger } from './logger';
import cors from 'cors';
import { WithContext, Dataset } from 'schema-dts';
import swagger from './swagger.json';


// Defaults to localhost if unspecified
export const elasticsearchUrl = process.env.PASC_ELASTICSEARCH_URL || "http://localhost:9200/";
const elasticsearchUsername = process.env.SEARCHKIT_ELASTICSEARCH_USERNAME;
const elasticsearchPassword = process.env.SEARCHKIT_ELASTICSEARCH_PASSWORD;
const debugEnabled = process.env.PASC_DEBUG_MODE === 'true';

let elasticsearch: Elasticsearch;

if (elasticsearchUsername && elasticsearchPassword) {
  elasticsearch = new Elasticsearch(elasticsearchUrl, {username: elasticsearchUsername, password: elasticsearchPassword});
} else {
  elasticsearch = new Elasticsearch(elasticsearchUrl);
}


export function checkBuildDirectory() {
  if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    logger.error(
      'Production startup failed as the application has not been built. ' +
      'Run command \'npm run build\' and try again.'
    );
    process.exit(16);
  }
}

export function checkEnvironmentVariables(production: boolean) {
  if (_.isEmpty(elasticsearchUrl)) {
    logger.error(
      'Unable to start Data Catalogue application. Missing environment variable PASC_ELASTICSEARCH_URL.'
    );
    process.exit(17);
  } else {
    logger.info('Using Elasticsearch instance at %s', elasticsearchUrl);
  }
  if (production) {
    if (debugEnabled) {
      logger.warn('Debug mode is enabled. Disable for production use.');
    }
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Node environment is not set to production.');
    }
  } else {
    if (debugEnabled) {
      logger.info('Debug mode is enabled.');
    }
  }
}

function getSearchkitRouter() {
  const router = express.Router();
  const host = _.trimEnd(elasticsearchUrl, '/');

  const requestClient = request.defaults({ pool: { maxSockets: 500 } });

  const esAuth: CoreOptions["auth"] = {
    username: elasticsearchUsername,
    password: elasticsearchPassword,
    sendImmediately: true
  };

  // Get a record directly
  router.get('/_get/:index/:id', async (req, res) => {
    try {
      const source = await elasticsearch.getStudy(req.params.id, req.params.index);
      res.send(source);
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });

  // Get similar records based on a study title
  router.get('/_similars/:index/', async (req, res) => {
    try {
      const similars = await elasticsearch.getSimilars(String(req.query.title), String(req.query.id), req.params.index);
      res.send(similars);
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });

  // Get the total studies stored in Elasticsearch
  router.get('/_total_studies', async (_req, res) => {
    try {
      const totalStudies = await elasticsearch.getTotalStudies();
      res.send({ totalStudies: totalStudies });
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });


  // Proxy Searchkit requests
  router.post('/_search', responseTime(uiResponseTimeHandler), (req, res) => {

    //timer required for responseTime in zero elasticsearch response
    const startTime = new Date();

    res.setHeader('Cache-Control', 'no-cache, max-age=0');

    const fullUrl = `${host}/${req.body.index || 'cmmstudy_en'}${req.url}`;
    logger.debug('Start Elasticsearch Request: %s', fullUrl);

    if (_.isObject(req.body)) {
      logger.debug('Request body', { body: req.body });
    }
    
    //keep language for use in metrics
    req.params = req.body.index
    //delete language from body request
    delete req.body.index;

    requestClient.post({
      url: fullUrl,
      body: req.body,
      json: _.isObject(req.body),
      forever: true,
      auth: esAuth
    }, (_error, _response, body: SearchResponse | undefined) => {
      //callback function to register metrics of zero results from elasticsearch
      if (body) {
        const hits = body.hits.total;
        if (hits == 0) {
          const endTime = new Date();
          const timeDiff = endTime.getTime() - startTime.getTime(); //in ms
          uiResponseTimeZeroElasticResultsHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
          }, timeDiff);
          uiResponseTimeTotalFailedHistogram.observe({
            method: req.method,
            route: req.route.path
          }, timeDiff);
        }
      }
    }).on('response', (response) => {
      logger.debug('Finished Elasticsearch Request to %s', fullUrl, response.statusCode);
    }).on('error', (response) => {
      // When a connection error occurs send a 502 error to the client.
      logger.error('Elasticsearch Request failed: %s: %s', fullUrl, response.message);
      res.sendStatus(502);
    }).pipe(res);
  });

  return router;
}

/**
 * Common error handler for Elasticsearch errors.
 * @param e the caught error.
 * @param res the response to send to the client.
 */
function elasticsearchErrorHandler(e: unknown, res: Response) {
   if (e instanceof ConnectionError) {
    // Elasticsearch didn't respond, send 502.
    logger.error('Elasticsearch Request failed: %s', e.message);
    res.sendStatus(502);

  } else if (e instanceof ResponseError) {
    // Elasticsearch returned an error.
    logger.warn('Elasticsearch returned error: %s', e);
    res.sendStatus(e.statusCode);
    
  } else {
    // An unknown error occured.
    logger.error('Error occured when handling Elasticsearch request: %s', e);
    res.sendStatus(503);
  }
}

const maxApiLimit = 200;

function externalApiV1() {

  const router = express.Router();

  router.get('/search', async (req, res) => {

    const accepts = req.accepts(["json", "application/ld+json"]);

    // Skip performing work if the client won't accept the response.
    if (!accepts) {
      res.sendStatus(406);
      return;
    }

    const { metadataLanguage, q } = req.query;

    if (!metadataLanguage) {
      res.status(400).send({ message: 'Please provide a search language'});
      return;
    }

    //Prepare body for ElasticSearch
    const bodyQuery = bodybuilder();

    // Validate the limit parameter
    let limit: number;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit <= 0) {
        res.status(400).send({ message: 'limit must be a positive integer'});
        return;
      } else if (limit > maxApiLimit) {
        res.status(400).send({ message: `limit must be maximum ${maxApiLimit}`});
        return;
      } else {
        bodyQuery.size(limit);
      }
    } else {
      limit = 10;
    }

    bodyQuery.size(limit);

    // Validate the offset parameter
    let offset: number = 0;
    if (req.query.offset !== undefined) {
      offset = Number(req.query.offset);
      if (req.query.offset === '' || !Number.isInteger(offset) || offset < 0) {
        res.status(400).send({ message: 'offset must be a positive integer'});
        return;
      } else {
        bodyQuery.from(offset);
      }
    }

    //create json body for ElasticSearchClient - search query
    if (_.isString(q)) {
      bodyQuery.query('query_string', {
        query: q,
        lenient: true,
        default_operator: "AND"
      });
    }

    //Create json body for ElasticSearchClient - nested post-filters
    buildNestedFilters(bodyQuery, req.query.classifications, 'classifications', 'classifications.term');
    buildNestedFilters(bodyQuery, req.query.studyAreaCountries, 'studyAreaCountries', 'studyAreaCountries.searchField');
    buildNestedFilters(bodyQuery, req.query.publishers, 'publisherFilter', 'publisherFilter.publisher');

    //Create json body for ElasticSearchClient - date-filters
    let dataCollectionYearMin = req.query.dataCollectionYearMin ? Number(req.query.dataCollectionYearMin) : undefined;
    let dataCollectionYearMax = req.query.dataCollectionYearMax ? Number(req.query.dataCollectionYearMax) : undefined;
    if (dataCollectionYearMin || dataCollectionYearMax) {
      if (!Number.isInteger(dataCollectionYearMin)) {
        dataCollectionYearMin = undefined;
      }
      if (!Number.isInteger(dataCollectionYearMax)) {
        dataCollectionYearMax = undefined;
      }
      bodyQuery.filter('range', 'dataCollectionYear', { gte: dataCollectionYearMin, lte: dataCollectionYearMax });
    }

    //Meta-Info to send with response
    const searchTerms = {
      metadataLanguage: metadataLanguage,
      queryTerm: q,
      limit: req.query.limit,
      offset: req.query.offset,
      classifications: req.query.classifications,
      studyAreaCountries: req.query.studyAreaCountries,
      publishers: req.query.publishers,
      dataCollectionYearMin: req.query.dataCollectionYearMin,
      dataCollectionYearMax: req.query.dataCollectionYearMax,
   }

    //Prepare the Client
    try {
      const response = await elasticsearch.client.search<CMMStudy>({
        index: `cmmstudy_${metadataLanguage}`,
        body: bodyQuery.build(),
        track_total_hits: true
      });

      /* 
       * Send the Response.
       *
       * We default to sending the CMMStudy model, only sending JSON-LD if specifically requested.
       */
      const resultsCount = apiResultsCount(offset, limit, response.body.hits.hits.length, Number(response.body.hits.total));
      switch (accepts) {
        case "json": 
          res.json({
            SearchTerms: searchTerms,
            ResultsCount: resultsCount,
            Results: response.body.hits.hits.map(obj => obj._source)
          });
          break;
        case "application/ld+json":
          const studyModels: CMMStudy[] = response.body.hits.hits.map(hit => getStudyModel(hit));
          const jsonLdArray: WithContext<Dataset>[] = studyModels.map((value) => getJsonLd(value));
          res.contentType("application/ld+json").json({
            SearchTerms: searchTerms,
            ResultsCount: resultsCount,
            Results: jsonLdArray
          });
          break;
        default:
          // We shouldn't end up here, but just in case respond with something.
          res.sendStatus(500);
          break;
      }
    } catch (e) {
      logger.error('Elasticsearch API Request failed: %s', (e as Error));
      res.status(502).send({ message: (e as Error).message });
    } finally {
      logger.debug('Finished API Elasticsearch Request');
    }
  });
  
  return router;
}

/**
 * Build filters for nested documents. The filter uses a term query
 * 
 * @param bodyQuery the body query to add nested filters to.
 * @param query the term query, expected types are string or string[].
 * @param path the path to the nested document.
 * @param nestedPath the path to use in the nested document
 */
function buildNestedFilters(bodyQuery: Bodybuilder, query: string | string[] | ParsedQs | ParsedQs[] | undefined, path: string, nestedPath: string) {
  if (Array.isArray(query)) {
    bodyQuery.query('nested', { path: path }, (q: Bodybuilder) => {
      query.forEach(value => q.orQuery('term', nestedPath, value));
      return q;
    });
  } else if (_.isString(query)) {
    bodyQuery.query('nested', { path: path }, (q: Bodybuilder) => q.addQuery('term', nestedPath, query));
  }
}

/**
 * Track results returned from ElasticSearch.
 * 
 * @param offset the offset to start results from. Defaults to 0 if not set by user
 * @param limit the limit of results to be returned. Defaults to 200 if not set by user.
 * @param total The total results coming from ElasticSearch.
 */
 function apiResultsCount(offset: number, limit: number, retrieved: number, total: number) {
  let to: number = offset + limit;
  if (to > total) {
    to = total;
  }
  const resultsCount = {
    from: offset,
    to: to,
    retrieved: retrieved,
    available: total
  };
  return resultsCount;
}

function jsonProxy() {
  return proxy(elasticsearchUrl, {
    parseReqBody: false,
    proxyReqPathResolver: (req) => {
      const arr = _.trim(req.url, '/').split('/');
      const index = arr[0];
      const id = arr[1];
      return `${_.trimEnd(url.parse(elasticsearchUrl).pathname, '/')}/${index}/cmmstudy/${id}`;
    },
    // Add Elasticsearch authorisation if configured
    proxyReqOptDecorator: (proxyReqOpts) => {
      if (elasticsearchUsername && elasticsearchPassword) {
        proxyReqOpts.headers = {
          ...proxyReqOpts.headers,
          authorization: `Basic ${Buffer.from(`${elasticsearchUsername}:${elasticsearchPassword}`).toString('base64')}`
        };
      }
      return proxyReqOpts;
    },
    // Handle connection errors to Elasticsearch.
    proxyErrorHandler: (err, res) => {
      logger.error('Elasticsearch Request failed: %s', err?.message);
      res.sendStatus(502);
    },
    userResDecorator: (_proxyRes, proxyResData, userReq) => {
      const json = JSON.parse(proxyResData.toString('utf8'));
      if (!_.isEmpty(json._source)) {
        // If the client requests JSON-LD, return it
        if (userReq.accepts("application/ld+json")) {
          return getJsonLd(json._source);
        } else {
          return JSON.stringify(json._source);
        }
      } else {
        // When running in debug mode, return the actual response from Elasticsearch
        if (debugEnabled) {
          return proxyResData;
        } else {
          return "{\"error\":\"Requested record was not found.\"}";
        }
      }
    },
    filter: (req) => req.method === 'GET' && req.url.match(/[\/?]/gi)?.length === 2
  });
}

interface Metadata {
  creators: string;
  description: string;
  publisher: string;
  title: string;
  jsonLd: WithContext<Dataset>;
}

async function getMetadata(q: string, lang: string | undefined): Promise<Metadata | undefined> {
  // Default to English if the language is unspecified
  if (!lang) {
    lang = "en";
  }

  const study = await elasticsearch.getStudy(q, `cmmstudy_${lang}`);

  if (study) {
    return {
      creators: study.creators.join('; '),
      description: study.abstractShort,
      title: study.titleStudy,
      publisher: study.publisher.publisher,
      jsonLd: getJsonLd(getStudyModel({ _source: study }))
    };
  } else {
    return undefined;
  }
}

export async function renderResponse(req: express.Request, res: express.Response, ejsTemplate: string) {
  // Default to success
  let status: number = 200;

  let metadata: Metadata | undefined = undefined;

  const contentType = req.accepts("html", "application/ld+json");

  if (!contentType || (req.path !== "/detail" && contentType === "application/ld+json")) {
    // If the content type is unsupported, or if a client is requesting JSON-LD on anything that isn't a detail page return 406
    res.sendStatus(406);
    return;
  }

  if (req.path === "/detail" && req.query.q) {
    // If we are on the detail page and a query is set, retrive the JSON-LD metadata
    try {
      metadata = await getMetadata(req.query.q as string, req.query.lang as string | undefined);
      if (!metadata) {
        // Set status to 404, a study was not found
        status = 404;
      }
    } catch (e) {
      if (e instanceof ResponseError && e.statusCode === 404) {
        status = e.statusCode;
      } else {
        logger.error(`Cannot communicate with Elasticsearch: ${e}`);
        status = 503;
      }
    }
  }

  switch (contentType) {
    case "html":
      // Render the HTML template
      res.status(status).render(ejsTemplate, { metadata: metadata || {} });
      break;
    
    case "application/ld+json":
      // Send a JSON-LD response
      res.status(status).json(metadata?.jsonLd);
      break;
  
    default:
      // Unknown content type, return server error.
      res.sendStatus(500);
      break;
  }
}

/**
 * Start listening.
 * @param app the express instance.
 * @param handler the request handler for the React application.
 */
export function startListening(app: express.Express, handler: RequestHandler) {

  const port = Number(process.env.PASC_PORT || 8088);

  // Set up application middleware
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride());

  //Metrics middleware for API
  app.use('/api/DataSets', responseTime(apiResponseTimeHandler));

  // Set up request handlers
  app.use('/api/sk', getSearchkitRouter());
  app.use('/api/json', jsonProxy());
  app.use('/api/DataSets/v1', cors(),  externalApiV1());
  app.use('/swagger/api/DataSets/v1', cors(), ((_req, res) => res.json(swagger)) as express.RequestHandler);
  app.use('/api/mt', startMetricsListening());

  app.get('*', handler);

  const server = app.listen(port, () => logger.info('Data Catalogue is running at http://localhost:%s/', port));

  // Set up exit handler, gracefully terminating the server on exit.
  process.on('exit', () => {
    logger.info('Shutting down');
    server.close(() => logger.info('Shut down'));
  });

  // Set up signal handers
  process.on('SIGINT', () =>  process.exit(130));
  process.on('SIGTERM', () => process.exit(143));
}
