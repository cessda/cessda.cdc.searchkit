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
import { URL, URLSearchParams } from 'url';
import client from 'prom-client';
import { Request, RequestHandler, Response } from 'express';
import Elasticsearch from './elasticsearch';

//Metrics for api
const apiResponseTimeHistogram = new client.Histogram({
  name: 'api_response_time_duration_seconds_all',
  help: 'REST API response time in ms for all requests',
  labelNames: ['method', 'route', 'status_code']
});
//Metrics for api - language
const apiResponseTimeLangHistogram = new client.Histogram({
  name: 'api_response_time_duration_seconds_language',
  help: 'REST API response time in seconds for Language',
  labelNames: ['method', 'route', 'lang', 'status_code']
});
//Metrics for api - publisher
const apiResponseTimePublisherHistogram = new client.Histogram({
  name: 'api_response_time_duration_seconds_publisher_api',
  help: 'REST API response time in seconds for Publisher, External API',
  labelNames: ['method', 'route', 'publ', 'status_code']
});
//Metrics for User Interface - all
const uiResponseTimeHistogram = new client.Histogram({
  name: 'ui_response_time_duration_seconds_all',
  help: 'User Interface response time in ms for all requests',
  labelNames: ['method', 'route', 'status_code']
});
//Metrics for User Interface - language
const uiResponseTimeLangHistogram = new client.Histogram({
  name: 'ui_response_time_duration_seconds_language',
  help: 'User Interface response time in seconds per language.',
  labelNames: ['method', 'route', 'lang', 'status_code']
});
//Metrics for User Interface - publisher
const uiResponseTimePublisherHistogram = new client.Histogram({
  name: 'ui_response_time_duration_seconds_publisher_api',
  help: 'User Interface response time in seconds per publisher.',
  labelNames: ['method', 'route', 'publ', 'status_code']
});
//Metrics for ES - Studies Languages
const languageGauge = new client.Gauge({
  name: 'studies_languages',
  help: 'Amount of records per language',
  labelNames: ['language'],
});
//Metrics for ES - Studies Endpoints
const endpointGauge = new client.Gauge({
  name: 'studies_endpoints',
  help: 'Amount of records per endpoint',
  labelNames: ['endpoint'],
});

/**
 * Initialise Prometheus metrics
 */
function initialiseMetrics(esClient: Elasticsearch) {
  client.collectDefaultMetrics(); //general cpu, mem, etc information

  // Initialise language and endpoint gauges from Elasticsearch
  languageGauges(esClient);
  endpointGauges(esClient);
}

/**
 * Initialise the language gauge by quering Elasticsearch for the amount of studies in each language
 */
async function languageGauges(esClient: Elasticsearch) {
  try {
    const languages = await esClient.getListOfMetadataLanguages();
    for (const result of languages) {
      const currentValue = await esClient.getRecordCountByLanguage(result) || 0;
      languageGauge.set({ language: result }, currentValue);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch(e) {
    // retry after 5 seconds if ES is not available
    setTimeout(() => languageGauges(esClient), 5000);
  }
}

/**
 * Initialise the endpoint gauge by querying Elasticsearch for the amount of studies per OAI-PMH endpoint
 */
async function endpointGauges(esClient: Elasticsearch) {
  try {
    const endpoints = await esClient.getEndpoints();
    for (const result of endpoints) {
      endpointGauge.set({ endpoint: String(result.key) }, result.doc_count);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch(e) {
    // retry after 5 seconds if ES is not available
    setTimeout(() => endpointGauges(esClient), 5000);
  }
}

export function uiResponseTimeHandler(req: Request, res: Response, time: number) {
  // Convert milliseconds into seconds
  time = time / 1000;

  if (req.query.size === undefined && req.headers.referer!==undefined) { //to exclude calls to _search?size=... etc & not log metrics from internal ES API

    //ALL
    if (req?.route?.path) {
      uiResponseTimeHistogram.observe({
        method: req.method,
        route: req.route.path,
        status_code: res.statusCode
      }, time);

      //LANG
      const indexName = req.body[0]?.indexName;
      if (typeof indexName === "string") {
        const lang = indexName.split("_")[1];
        uiResponseTimeLangHistogram.observe({
          method: req.method,
          route: req.route.path,
          lang: lang,
          status_code: res.statusCode
        }, time);
      }

      //PUBLISHER
      const urlUI = new URL(req.headers.referer);
      const paramsUI = new URLSearchParams(urlUI.search);
      if (paramsUI.has('publisher.publisher[0]')) { //searching for at least 1 publisher
        paramsUI.forEach(function (value, key) {
          if (key.includes("publisher")) {
            uiResponseTimePublisherHistogram.observe({
              method: req.method,
              route: req.route.path,
              publ: value,
              status_code: res.statusCode
            }, time);
          }
        });
      }
    }
  }
}

export function apiResponseTimeHandler(req: Request, res: Response, time: number) {
  // Convert milliseconds into seconds
  time = time / 1000;

  //ALL
  if (req?.route?.path) {
    apiResponseTimeHistogram.observe({
      method: req.method,
      route: req.route.path,
      status_code: res.statusCode
    }, time);
    //LANG
    if (req.query.metadataLanguage) {
      apiResponseTimeLangHistogram.observe({
        method: req.method,
        route: req.route.path,
        lang: String(req.query.metadataLanguage),
        status_code: res.statusCode
      }, time);
    }
    //PUBLISHER
    if (req.query.publishers) {
      const publishers = req.query.publishers;
      if (Array.isArray(publishers)) {
        publishers.forEach(value => observePublisher(req, String(value), res.statusCode, time));
      } else {
        observePublisher(req, String(publishers), res.statusCode, time);
      }
    }
  }
}

function observePublisher(req: Request, value: string, statusCode: number, time: number) {
  apiResponseTimePublisherHistogram.observe({
    method: req.method,
    route: req.route.path,
    publ: value,
    status_code: statusCode
  }, time);
}

/**
 *  Endpoint used for Prometheus Metrics
 */
export function metricsRequestHandler(esClient: Elasticsearch): RequestHandler {
  initialiseMetrics(esClient);
  return async (_req, res) => {
    const metrics = await client.register.metrics();
    res.type(client.register.contentType).send(metrics);
  };
}
