// Copyright CESSDA ERIC 2017-2025
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

import fs from "fs";
import path from "path";
import _ from "lodash";
import express, { RequestHandler } from "express";
import bodyParser from "body-parser";
import compression from "compression";
import methodOverride from "method-override";
import responseTime from "response-time";
import { CMMStudy, getJsonLd, getStudyModel } from "../common/metadata";
import { thematicViews } from "../common/thematicViews";
import {
  apiResponseTimeHandler,
  metricsRequestHandler,
  uiResponseTimeHandler,
} from "./metrics";
import Elasticsearch from "./elasticsearch";
import { estypes } from "@elastic/elasticsearch";
import { errors } from "@elastic/transport";
import { Response } from "express";
import { logger } from "./logger";
import cors from "cors";
import { WithContext, Dataset } from "schema-dts";
import swaggerSearchApiV2 from "./swagger-searchApiV2";
import Client from "@searchkit/api";
import 'isomorphic-unfetch';
import { getELSSTRouter } from "./elsst";

const { ConnectionError, ResponseError } = errors;

interface ElasticError {
  statusCode?: number;
  message?: string;
}

const SEARCH_FIELDS_WITH_BOOSTS = [
  "titleStudy^4",
  "abstract^2",
  "creatorsSearchField^2",
  "keywordsSearchField^1.5"
];

// Defaults to localhost if unspecified
export const elasticsearchUrl =
  process.env.PASC_ELASTICSEARCH_URL || "http://localhost:9200/";
const elasticsearchUsername = process.env.SEARCHKIT_ELASTICSEARCH_USERNAME;
const elasticsearchPassword = process.env.SEARCHKIT_ELASTICSEARCH_PASSWORD;
const debugEnabled = process.env.PASC_DEBUG_MODE === "true";

// Elasticsearch credentials, if set
let elasticsearchAuth = undefined;
if (elasticsearchUsername && elasticsearchPassword) {
  elasticsearchAuth = {
    username: elasticsearchUsername,
    password: elasticsearchPassword,
  }
}

const elasticsearch: Elasticsearch = new Elasticsearch(elasticsearchUrl, elasticsearchAuth);

// Proxy client for Searchkit
// See https://www.searchkit.co/docs/proxy-elasticsearch/with-express-js
const apiClient = Client({
  connection: {
    host: _.trimEnd(elasticsearchUrl, "/"),
    auth: elasticsearchAuth,
  },
  search_settings: {
    highlight_attributes: ["titleStudy", "abstract"],
    snippet_attributes: ["abstract"],
    search_attributes:
      SEARCH_FIELDS_WITH_BOOSTS.map((entry) => {
        const [field, weight] = entry.split("^");
        return {
          field,
          weight: parseFloat(weight)
        };
      }),
    result_attributes: ["titleStudy", "abstract", "creators", "keywords", "dataAccess", "langAvailableIn", "studyUrl"],
    facet_attributes: [
      {
        attribute: "keywords",
        field: "term.normalized",
        type: "string",
        nestedPath: "keywords"
      },
      {
        attribute: "classifications",
        field: "term.normalized",
        type: "string",
        nestedPath: "classifications"
      },
      {
        attribute: "dataAccess",
        field: "dataAccess",
        type: "string"
      },
      {
        attribute: "collectionYear",
        field: "dataCollectionYear",
        type: "numeric"
      },
      {
        attribute: "country",
        field: "searchField",
        type: "string",
        nestedPath: "studyAreaCountries"
      },
      {
        attribute: "publisher",
        field: "publisher",
        type: "string",
        nestedPath: "publisherFilter"
      },
      {
        attribute: "timeMethod",
        field: "term.normalized",
        type: "string",
        nestedPath: "typeOfTimeMethods"
      },
      {
        attribute: "timeMethodCV",
        field: "id",
        type: "string",
        nestedPath: "typeOfTimeMethods"
      },
    ],
    sorting: {
      default: {
        field: '_score',
        order: 'desc'
      },
      _title_desc: {
        field: 'titleStudy.normalized',
        order: 'desc'
      },
      _title_asc: {
        field: 'titleStudy.normalized',
        order: 'asc'
      },
      _collection_date_desc: {
        field: 'dataCollectionYear',
        order: 'desc'
      },
      _collection_date_asc: {
        field: 'dataCollectionYear',
        order: 'asc'
      },
      _publication_year_desc: {
        field: 'publicationYear',
        order: 'desc'
      },
      _publication_year_asc: {
        field: 'publicationYear',
        order: 'asc'
      },
    }
  },
}, {
  debug: debugEnabled
});

export function checkBuildDirectory() {
  if (!fs.existsSync(path.join(__dirname, "../dist"))) {
    logger.error(
      "Production startup failed as the application has not been built. " +
        "Run command 'npm run build' and try again."
    );
    process.exit(16);
  }
}

export function checkEnvironmentVariables(production: boolean) {
  if (_.isEmpty(elasticsearchUrl)) {
    logger.error(
      "Unable to start Data Catalogue application. Missing environment variable PASC_ELASTICSEARCH_URL."
    );
    process.exit(17);
  } else {
    logger.info("Using Elasticsearch instance at %s", elasticsearchUrl);
  }
  if (production) {
    if (debugEnabled) {
      logger.warn("Debug mode is enabled. Disable for production use.");
    }
    if (process.env.NODE_ENV !== "production") {
      logger.warn("Node environment is not set to production.");
    }
  } else {
    if (debugEnabled) {
      logger.info("Debug mode is enabled.");
    }
  }
}

function getSearchkitRouter() {
  const router = express.Router();
  const host = _.trimEnd(elasticsearchUrl, "/");

  // Get a record directly
  router.get("/_get/:index/:id", async (req, res) => {
    try {
      const source = await elasticsearch.getStudy(
        req.params.id,
        req.params.index
      );

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
        similars: similars,
      });
    } catch (e) {
      if (e instanceof ResponseError && e.statusCode === 404) {
        // Try to find if the study is available in other languages
        // Assumes that index name can be split by "_" to get common part as [0] and language as [1]
        const indices = await elasticsearch.getIndicesForStudyId(req.params.id, req.params.index.split("_")[0]);
        res.status(404).json(indices.map(i=> i.split("_")[1]));
        return;
      }

      elasticsearchErrorHandler(e, res);
    }
  });

  // Get similar records based on a study title
  router.get("/_similars/:index/", async (req, res) => {
    try {
      const similars = await elasticsearch.getSimilars(
        String(req.query.title),
        String(req.query.id),
        req.params.index
      );
      res.send(similars);
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });

  // Get the total studies stored in Elasticsearch
  router.get("/_total_studies", async (_req, res) => {
    try {
      const totalStudies = await elasticsearch.getTotalStudies();
      res.send({ totalStudies: totalStudies });
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });

  // Get the total studies stored in Elasticsearch
  router.get("/_about_metrics/:index/", async (req, res) => {
    try {
      const aboutMetrics = await elasticsearch.getAboutMetrics(req.params.index);
      res.send(aboutMetrics);
    } catch (e) {
      elasticsearchErrorHandler(e, res);
    }
  });

  // Proxy Searchkit requests
  router.post("/_search", responseTime(uiResponseTimeHandler), async (req, res) => {
    res.setHeader("Cache-Control", "no-cache, max-age=0");

    const fullUrl = `${host}/${req.body.index || "cmmstudy_en"}${req.url}`;
    logger.debug("Start Elasticsearch Request: %s", fullUrl);

    const userQuery = req.body?.[0]?.params?.query || "";

    // Extract negated phrases and terms from raw user query
    const exclusionPattern = /-"([^"]+)"|-(\S+)/g;
    const allExclusions: string[] = [];
    let cleanedQuery = userQuery;

    let match: RegExpExecArray | null;
    while ((match = exclusionPattern.exec(userQuery)) !== null) {
      const term = match[1] || match[2];
      allExclusions.push(term);
      cleanedQuery = cleanedQuery.replace(match[0], ' ');
    }

    // Normalize spacing to get the final positive query
    const positiveQuery = cleanedQuery
      .replace(/\s*\+\s*/g, '+')
      .replace(/\s*\|\s*/g, '|')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const response = await apiClient.handleRequest(req.body, {
        hooks: {
          // Hook to edit search request before it is executed
          beforeSearch: async (searchRequests) => {
            return searchRequests.map((sr) => {
              // Build the must clause
              const mustClause = positiveQuery
                ? {
                  simple_query_string: {
                    query: positiveQuery,
                    default_operator: "AND" as estypes.QueryDslOperator,
                    fields: [...SEARCH_FIELDS_WITH_BOOSTS, "*"],
                    flags: "AND|OR|PHRASE|PRECEDENCE"
                  }
                }
                : { match_all: {} };

              // Build the must_not clause if there are negative terms
              const mustNotClause = allExclusions.length
                ? allExclusions.map((term) => ({
                  multi_match: {
                    query: term,
                    fields: [...SEARCH_FIELDS_WITH_BOOSTS, "*"],
                    type: "phrase" as estypes.QueryDslTextQueryType
                  }
                }))
                : [];

              return {
                ...sr,
                body: {
                  ...sr.body,
                  track_total_hits: true, // Remove limit of 10000 results at the cost of speed
                  query: {
                    bool: {
                      must: mustClause,
                      must_not: mustNotClause,
                      filter: sr.body?.query?.bool?.filter || [] // Preserve existing filters
                    }
                  }
                }
              };
            });
          }
        }
      });

      logger.debug("Finished Elasticsearch Request to %s", fullUrl);
      res.send(response);
    } catch (e: unknown) {
      logger.error("Elasticsearch Request failed: %s: %s", fullUrl, e);
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
  const u = e as ElasticError;
  if (u instanceof ConnectionError) {
    // Elasticsearch didn't respond, send 502.
    logger.error("Elasticsearch Request failed: %s", u.message);
    res.sendStatus(502);
  } else if (u instanceof ResponseError && u.statusCode) {
    if (u.statusCode === 404) {
      // Elasticsearch returned not found.
      logger.debug("Elasticsearch returned not found: %s", u);
      res.sendStatus(u.statusCode);
    } else {
      // Elasticsearch returned an error.
      logger.warn("Elasticsearch returned error: %s", u);
      res.sendStatus(u.statusCode);
    }
  } else {
    // An unknown error occured.
    logger.error("Error occured when handling Elasticsearch request: %s", u);
    res.sendStatus(503);
  }
}

const maxApiLimit = 200;

function externalApiV2() {

  const router = express.Router();

  router.get("/search", async (req, res) => {
    const accepts = req.accepts(["json", "application/ld+json"]);

    // Skip performing work if the client won't accept the response.
    if (!accepts) {
      res.sendStatus(406);
      return;
    }


    const { metadataLanguage, q, sortBy } = req.query;

    if (!metadataLanguage) {
      res.status(400).send({ message: 'Please provide a search language'});
      return;
    }

    //Prepare body for ElasticSearch
    let sort: estypes.Sort | undefined = undefined;

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
          'titleStudy.normalized': 'asc'
        };
        break;
      case "titleDescending":
        sort = {
          'titleStudy.normalized': 'desc'
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
    const boolQuery: estypes.QueryDslBoolQuery = {};

    // Holds the main simple_query_string and nested queries
    const mustQuery: estypes.QueryDslQueryContainer[] = [];

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
          fields: [...SEARCH_FIELDS_WITH_BOOSTS, "*"],
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
      };

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
function buildNestedFilters(query: unknown, path: string, nestedPath: string): estypes.QueryDslNestedQuery {
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
function apiResultsCount(
  offset: number,
  limit: number,
  retrieved: number,
  total: number
) {
  let to: number = offset + limit;
  if (to > total) {
    to = total;
  }
  return {
    from: offset,
    to: to,
    retrieved: retrieved,
    available: total,
  };
}

function jsonProxy() {
  const router = express.Router();

  router.get('/:index/:id', async (req, res) => {
    try {
      // Check if the client requests supported formats
      const accepts = req.accepts(["json", "application/ld+json"]);
      if (!accepts) {
        res.sendStatus(406);
        return;
      }

      const study = await elasticsearch.getStudy(req.params.id, req.params.index);

      // If the client requests JSON-LD, return it
      switch (accepts) {
        case "application/ld+json":
          res.send(getJsonLd(getStudyModel(study)));
          return;
        case "json":
          res.send(study);
          return;
      }
    } catch (err) {
      elasticsearchErrorHandler(err, res);
    }
  });

  return router;
}

export interface Metadata {
  creators: string;
  description: string;
  publisher: string;
  title: string;
  jsonLd: WithContext<Dataset>;
  id: string;
}

async function getMetadata(
  q: string,
  lang: string | undefined
): Promise<Metadata | undefined> {
  // Default to English if the language is unspecified
  if (!lang) {
    lang = "en";
  }

  const response = await elasticsearch.getStudy(q, `cmmstudy_${lang}`);

  if (response) {
    const study = getStudyModel(response);
    return {
      creators: study.creators.join("; "),
      description: study.abstractShort,
      title: study.titleStudy,
      publisher: study.publisher.publisher,
      jsonLd: getJsonLd(study),
      id: study.id,
    };
  } else {
    return undefined;
  }
}

const paths = thematicViews.map(thematicView =>
  thematicView.path
);

export async function renderResponse(
  req: express.Request,
  res: express.Response,
  ejsTemplate: string
) {
  // Default to success
  let status = 200;

  let metadata: Metadata | undefined = undefined;

  const contentType = req.accepts("html", "application/ld+json");

  if (
    !contentType ||
    (!req.path.includes("/detail") && contentType === "application/ld+json")
  ) {
    // If the content type is unsupported, or if a client is requesting JSON-LD on anything that isn't a detail page return 406
    res.sendStatus(406);
    return;
  }

/*

  switch (req.path) {
    // The root path and the about path always return 200
    case "/":
    case "/about":
      case "/accessibility-statement":
      status = 200;
      break;

    case "/detail":
      if (req.query.q) {
        // If we are on the detail page and a query is set, retrive the JSON-LD metadata
        try {
          metadata = await getMetadata(
            req.query.q as string,
            req.query.lang as string | undefined
          );
          if (!metadata) {
            // Set status to 404, a study was not found
            status = 404;
          }
        } catch (e: unknown) {
          const u = e as ElasticError;
          if (u instanceof ResponseError && u.statusCode === 404) {
            status = u.statusCode;
          } else {
            logger.error(`Cannot communicate with Elasticsearch: ${u}`);
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
*/

status = 404;

if ( req.path.includes("/about") ) {
  status = 200;
}
if ( req.path.includes("/accessibility-statement") ) {
  status = 200;
}

if ( req.path.includes("/documentation") ) {
  status = 200;
}

if ( req.path.includes("/collections") ) {
  status = 200;
}

if ( paths.includes(req.path) ) {
  status = 200;
}

if ( req.path.includes("/detail") ) {
   if (req.query.q) {
    // If we are on the detail page and a query is set, retrive the JSON-LD metadata
    try {
      metadata = await getMetadata(
        req.query.q as string,
        req.query.lang as string | undefined
      );
      if (!metadata) {
        // Set status to 404, a study was not found
        status = 404;
      }
    } catch (e: unknown) {
      const u = e as ElasticError;
      if (u instanceof ResponseError && u.statusCode === 404) {
        status = u.statusCode;
      } else {
        logger.error(`Cannot communicate with Elasticsearch: ${u}`);
        status = 503;
      }
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
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  //Metrics middleware for API
  app.use("/api/DataSets", responseTime(apiResponseTimeHandler));

  // Set up request handlers
  app.use("/api/sk", getSearchkitRouter());
  app.use('/api/elsst', getELSSTRouter());
  app.post("/api/search", async (req, res) => {
    const response = await apiClient.handleRequest(req.body);
    res.send(response);
  });
  app.use("/api/json", jsonProxy());
  app.use("/api/DataSets/v2", cors(), externalApiV2());
  app.use("/swagger/api/DataSets/v2", cors(), async (_req, res) => {
    try {
      if (!v2) {
        v2 = await swaggerSearchApiV2(elasticsearch);
      }
      res.json(v2);
    } catch (e) {
      logger.error(`Cannot communicate with Elasticsearch: ${e}`);
      res.sendStatus(500);
    }
  });

  app.use("/metrics", metricsRequestHandler(elasticsearch));

  app.get(/(.*)/, handler);

  const server = app.listen(port, () =>
    logger.info("Data Catalogue is running at http://localhost:%s/", port)
  );

  // Set up exit handler, gracefully terminating the server on exit.
  process.on("exit", () => {
    logger.info("Shutting down");
    server.close(() => logger.info("Shut down"));
  });

  // Set up signal handers
  process.on("SIGINT", () => process.exit(130));
  process.on("SIGTERM", () => process.exit(143));
}

// Cached Swagger JSON
let v2: Awaited<ReturnType<typeof swaggerSearchApiV2>> | undefined = undefined;
