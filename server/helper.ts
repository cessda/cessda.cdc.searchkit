// Copyright CESSDA ERIC 2017-2024
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
import _ from 'lodash';
import proxy from 'express-http-proxy';
import express, { RequestHandler } from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import methodOverride from 'method-override';
import responseTime from 'response-time';
import { CMMStudy, RelatedPublication, getJsonLd, getStudyModel } from '../common/metadata';
import { apiResponseTimeHandler, metricsRequestHandler, observeAPIClientIP, uiResponseTimeHandler } from './metrics';
import Elasticsearch from './elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { Response } from 'express';
import { logger } from './logger';
import cors from 'cors';
import { WithContext, Dataset } from 'schema-dts';
import swaggerSearchApiV2 from './swagger-searchApiV2';
import fetch, { Request } from 'node-fetch';
import { Agent } from 'http';
import IPinfoWrapper, { ApiLimitError } from "node-ipinfo";
import { getELSSTRouter } from './elsst';
import { QueryDslBoolQuery, QueryDslNestedQuery, QueryDslQueryContainer, Sort } from '@elastic/elasticsearch/lib/api/types';


// Defaults to localhost if unspecified
const elasticsearchUrl = process.env.PASC_ELASTICSEARCH_URL || "http://localhost:9200/";
const elasticsearchUsername = process.env.SEARCHKIT_ELASTICSEARCH_USERNAME;
const elasticsearchPassword = process.env.SEARCHKIT_ELASTICSEARCH_PASSWORD;
const debugEnabled = process.env.PASC_DEBUG_MODE === 'true';
const ipinfoAPIKey = process.env.SEARCHKIT_IPINFO_API_KEY;

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

  const httpAgent = new Agent({
    keepAlive: true
  });

  // Get a record directly
  router.get('/_get/:index/:id', async (req, res) => {
    try {
      const source = await elasticsearch.getStudy(req.params.id, req.params.index);

      let similars: Awaited<ReturnType<typeof elasticsearch.getSimilars>>;

      // Get similars
      if (source?.titleStudy) {
        similars = await elasticsearch.getSimilars(source?.titleStudy, req.params.id, req.params.index);
      } else {
        similars = [];
      }

      if(source){
        let otherLangPublications: Awaited<ReturnType<typeof elasticsearch.getRelatedPublications>> = [];
        try {
          // Get related publications from all other indices
          otherLangPublications = await elasticsearch.getRelatedPublications(req.params.id, 1000, req.params.index);
        } catch (e) {
          elasticsearchErrorHandler(e, res);
        }

        const selectedLang = req.params.index.split('_')[1];
        if(source.relatedPublications){
          // Add lang to the related publications of selected language
          source.relatedPublications.forEach(publication => {
            publication.lang = selectedLang;
          });
          // Add related publications in other languages
          source.relatedPublications.push(...otherLangPublications);
        } else {
          // Replace original relatedPublications with related publications found in other languages
          source.relatedPublications = otherLangPublications;
        }
      }

      // Send the response
      res.send({
        source: source,
        similars: similars
      });
    } catch (e) {
      if (e instanceof errors.ResponseError && e.statusCode === 404) {
        // Try to find if the study is available in other languages
        const indices = await elasticsearch.getIndicesForStudyId(req.params.id);
        res.status(404).json(indices.map(i => i.split("_")[1]));
        return;
      }

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
  router.post('/_search', responseTime(uiResponseTimeHandler), async (req, res) => {

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

    const request = new Request(fullUrl, {
      agent: httpAgent,
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {
        'Authorization': `Basic ${Buffer.from(`${elasticsearchUsername}:${elasticsearchPassword}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    try {
      const response = await fetch(request);

      // Set headers, forward Elasticsearch status
      res.status(response.status).setHeader('Content-Type', 'application/json');

      // Stream the response to the client
      response.body.pipe(res);

      logger.debug('Finished Elasticsearch Request to %s', fullUrl);
    } catch (e) {
      // When a connection error occurs send a 502 error to the client.
      logger.error('Elasticsearch Request failed: %s: %s', fullUrl, e);
      res.sendStatus(502);
    }
  });
  return router;
}

/**
 * Common error handler for Elasticsearch errors.
 * @param e the caught error.
 * @param res the response to send to the client.
 */
function elasticsearchErrorHandler(e: unknown, res: Response) {
   if (e instanceof errors.ConnectionError) {
    // Elasticsearch didn't respond, send 502.
    logger.error('Elasticsearch Request failed: %s', e.message);
    res.sendStatus(502);

  } else if (e instanceof errors.ResponseError) {
    // Elasticsearch returned an error.
    logger.warn('Elasticsearch returned error: %s', e);
    res.sendStatus(e.statusCode || 503);

  } else {
    // An unknown error occured.
    logger.error('Error occured when handling Elasticsearch request: %s', e);
    res.sendStatus(503);
  }
}

const maxApiLimit = 200;

function externalApiV2() {

  const router = express.Router();

  router.get('/search', async (req, res) => {

    const accepts = req.accepts(["json", "application/ld+json"]);

    // Skip performing work if the client won't accept the response.
    if (!accepts) {
      res.sendStatus(406);
      return;
    }

    // Get Visitors Information For Prom Metrics
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (ip) {
      const ipString = String(ip);

      if (ipinfoAPIKey) {

        //timeouts defaults to 5000 i.e. 5 seconds - can be changed if needed
        const ipinfoWrapper = new IPinfoWrapper(ipinfoAPIKey); //token must be parsed here
        ipinfoWrapper.lookupIp(ipString)
          .then(info => observeAPIClientIP(ipString, info))
          .catch((error) => {
            if (error instanceof ApiLimitError) {
                // handle api limit exceed error
                logger.warn(`ipinfo searchAPI limit exceeded : ${error}`);
            } else {
                // handle other errors
                logger.error(`error while getting searchAPI client's ip / country : ${error}`);
            }

            // Observe the IP without country information
            observeAPIClientIP(ipString);
          });
      } else {
        observeAPIClientIP(ipString);
      }
    }

    const { metadataLanguage, q, sortBy } = req.query;

    if (!metadataLanguage) {
      res.status(400).send({ message: 'Please provide a search language'});
      return;
    }

    //Prepare body for ElasticSearch
    let sort: Sort | undefined = undefined;

    //Implementing Sorting Options
    switch (sortBy) {
      case undefined: //if no sorting option is provided, sort by default Relevance - as UI
        sort = {
          _score: {
            order: 'desc'
          }
        };
        break;
      case "titleAscending":
        sort = {
          'titleStudy.raw': 'asc'
        };
        break;
      case "titleDescending":
        sort = {
          'titleStudy.raw': 'desc'
        };
        break;
      case "dateOfCollectionOldest":
        sort = {
          'dataCollectionPeriodEnddate': 'asc'
        };
        break;
      case "dateOfCollectionNewest":
        sort = {
          'dataCollectionPeriodEnddate': 'desc'
        };
        break;
      case "dateOfPublicationNewest":
        sort = {
          publicationYear: 'desc'
        };
        break;
      default:
        res.status(400).send({ message: 'Please provide a proper sorting option. Available: titleAscending, titleDescending, dateOfCollectionOldest, dateOfCollectionNewest, dateOfPublicationNewest'});
        return;
    }

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
      }
    } else {
      // Default limit if not provided
      limit = 10;
    }

    // Validate the offset parameter
    let offset = 0;
    if (req.query.offset !== undefined) {
      offset = Number(req.query.offset);
      if (req.query.offset === '' || !Number.isInteger(offset) || offset < 0) {
        res.status(400).send({ message: 'offset must be a positive integer'});
        return;
      }
    }

    // Container for the overall query
    const boolQuery: QueryDslBoolQuery = {};

    // Holds the main simple_query_string and nested queries
    const mustQuery: QueryDslQueryContainer[] = [];

    if (req.query.keywords) {
      // create keywords query
      mustQuery.push({
        simple_query_string: {
          query: (req.query.keywords as string),
          fields: ["keywordsSearchField"]
        }
      });
    } else if (_.isString(q)) {
      //create json body for ElasticSearchClient - search query
      mustQuery.push({
        simple_query_string: {
          query: q,
          lenient: true,
          default_operator: "AND",
          fields: [
            "titleStudy^4",
            "abstract^2",
            "creators^2",
            "keywords.term^1.5",
            "*"
          ],
          flags: "AND|OR|NOT|PHRASE|PRECEDENCE|PREFIX"
        }
      });
    }

    // Create json body for ElasticSearchClient - nested post-filters
    if (req.query.classifications) {
      mustQuery.push({ nested: buildNestedFilters(req.query.classifications, 'classifications', 'classifications.term') });
    }

    if (req.query.studyAreaCountries) {
      mustQuery.push({ nested: buildNestedFilters(req.query.studyAreaCountries, 'studyAreaCountries', 'studyAreaCountries.searchField') });
    }

    if (req.query.publishers) {
      mustQuery.push({ nested: buildNestedFilters(req.query.publishers, 'publisherFilter', 'publisherFilter.publisher') })
    }

    if (mustQuery.length > 0) {
      boolQuery.must = mustQuery;
    }

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
      boolQuery.filter = {
        range: {
          dataCollectionYear: {
            gte: dataCollectionYearMin,
            lte: dataCollectionYearMax
          }
        }
      };
    }



    //Prepare the Client
    try {
      const response = await elasticsearch.client.search<CMMStudy>({
        index: `cmmstudy_${metadataLanguage}`,
        track_total_hits: true,
        query: {
          bool: boolQuery
        },
        sort: sort,
        size: limit,
        from: offset
      });

      // Calculate the total hits
      const totalHits = Elasticsearch.parseTotalHits(response.hits.total) || 0;
      const resultsCount = apiResultsCount(offset, limit, response.hits.hits.length, totalHits);

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
        keywords: req.query.keywords,
        sortBy: req.query.sortBy
      }

      /*
       * Send the Response.
       *
       * We default to sending the CMMStudy model, only sending JSON-LD if specifically requested.
       */
      res.format({

        json: () => res.json({
          SearchTerms: searchTerms,
          ResultsCount: resultsCount,
          Results: response.hits.hits.map(obj => obj._source)
        }),

        // Respond with JSON-LD if specified by the client
        "application/ld+json": () => {
          const studyModels = response.hits.hits.map(hit => getStudyModel(hit._source));
          const jsonLdArray = studyModels.map((value) => getJsonLd(value));
          res.json({
            SearchTerms: searchTerms,
            ResultsCount: resultsCount,
            Results: jsonLdArray
          });
        }
      });
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
function buildNestedFilters(query: unknown, path: string, nestedPath: string): QueryDslNestedQuery {
  if (Array.isArray(query)) {
    return {
      path: path,
      query: {
        terms: {
          [nestedPath]: query
        }
      }
    };
  } else {
    return {
      path: path,
      query: {
        term: {
          [nestedPath]: {
            value: query
          }
        }
      }
    };
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

  // Calculate the position of the final result
  const to: number = Math.min(offset + limit, total);

  return {
    from: offset,
    to: to,
    retrieved: retrieved,
    available: total
  };
 }

function jsonProxy() {
  return proxy(elasticsearchUrl, {
    parseReqBody: false,
    proxyReqPathResolver: (req) => {
      const arr = _.trim(req.url, '/').split('/');
      const index = arr[0];
      const id = arr[1];
      return `${_.trimEnd(new URL(elasticsearchUrl).pathname, '/')}/${index}/_doc/${id}`;
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
    userResDecorator: (proxyRes, proxyResData, userReq) => {

      // Only parse the Elasticsearch response if a success status code is returned
      if (proxyRes.statusCode && proxyRes.statusCode < 400) {

        // Parse the response
        const json = JSON.parse(proxyResData.toString('utf8'));

        // If the client requests JSON-LD, return it
        switch (userReq.accepts(["json", "application/ld+json"])) {

          case "application/ld+json": {
            const cmmstudy = getStudyModel(json._source);
            return getJsonLd(cmmstudy);
          }

          case "json":
            return json._source;
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
    filter: (req) => req.method === 'GET' && req.url.match(/[/?]/gi)?.length === 2
  });
}

export interface Metadata {
  creators: string;
  description: string;
  publisher: string;
  title: string;
  jsonLd: WithContext<Dataset> | undefined;
  id: string;
}

async function getMetadata(q: string, lang: string | undefined): Promise<Metadata | undefined> {
  // Default to English if the language is unspecified
  if (!lang) {
    lang = "en";
  }

  const response = await elasticsearch.getStudy(q, `cmmstudy_${lang}`);

  if (response) {
    const study = getStudyModel(response);
    return {
      creators: study.creators.join('; '),
      description: study.abstractShort,
      title: study.titleStudy,
      publisher: study.publisher.publisher,
      jsonLd: study.abstract.length >= 50 ? getJsonLd(study) : undefined,
      id: study.id
    };
  } else {
    return undefined;
  }
}

export async function renderResponse(req: express.Request, res: express.Response, ejsTemplate: string) {
  // Default to success
  let status = 200;

  let metadata: Metadata | undefined = undefined;

  const contentType = req.accepts("html", "application/ld+json");

  if (!contentType || (req.path !== "/detail" && contentType === "application/ld+json")) {
    // If the content type is unsupported, or if a client is requesting JSON-LD on anything that isn't a detail page return 406
    res.sendStatus(406);
    return;
  }

  switch (req.path) {
    // The root path and the about path always return 200
    case "/":
    case "/about":
      status = 200;
      break;

    case "/detail":
      if (req.query.q) {
        // If we are on the detail page and a query is set, retrive the JSON-LD metadata
        try {
          metadata = await getMetadata(req.query.q as string, req.query.lang as string | undefined);
          if (!metadata) {
            // Set status to 404, a study was not found
            status = 404;
          }
        } catch (e) {
          if (e instanceof errors.ResponseError && e.statusCode === 404) {
            status = e.statusCode;
          } else {
            logger.error(`Cannot communicate with Elasticsearch: ${e}`);
            status = 503;
          }
        }
      } else {
        // No query parameter, return 404
        status = 404;
      }
      break;

    default:
      // All other URLs should return 404
      status = 404;
      break;
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
      // Unknown content type, return server error
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
  app.use('/api/elsst', getELSSTRouter());
  app.use('/api/json', jsonProxy());
  app.use('/api/DataSets/v2', cors(),  externalApiV2());
  app.use('/swagger/api/DataSets/v2', cors(), (async (_req, res) => {
    try {
      if (!v2) {
        // Initialise the API documentation
        v2 = await swaggerSearchApiV2(elasticsearch)
      }
      return res.json(v2);
    } catch (e) {
      logger.error(`Cannot communicate with Elasticsearch: ${e}`);
      return res.sendStatus(500);
    }
  }));

  // Metrics


  // Handle requests to /metrics
  app.get('/metrics', metricsRequestHandler(elasticsearch));

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

// Cached Swagger JSON
let v2: Awaited<ReturnType<typeof swaggerSearchApiV2>> | undefined = undefined;
