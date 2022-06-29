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
import { URL, URLSearchParams } from 'url'
import client from 'prom-client';
import express, { Request, Response } from 'express';

//METRICS FOR API
//Metrics for api - total
export const apiResponseTimeTotalHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_total',
    help: 'REST API response time total requests',
    labelNames: ['method', 'route']
})
//Metrics for api - total - failed
export const apiResponseTimeTotalFailedHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_total_failed',
    help: 'REST API response time total failed requests',
    labelNames: ['method', 'route']
})
//Metrics for api - user - failed
export const apiResponseTimeUserFailedHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_user_failed',
    help: 'REST API response time total user failed requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for api - system - failed
export const apiResponseTimeSystemFailedHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_system_failed',
    help: 'REST API response time total system failed requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for api - total - success
export const apiResponseTimeTotalSuccessHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_total_success',
    help: 'REST API response time total successful requests',
    labelNames: ['method', 'route']
})
//Metrics for api - all
export const apiResponseTimeAllHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_all',
    help: 'REST API response time in ms for all requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for api - language
export const apiResponseTimeLangHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_language',
    help: 'REST API response time in seconds for Language',
    labelNames: ['method', 'route', 'lang', 'status_code']
})
//Metrics for api - publisher
export const apiResponseTimePublisherHistogram = new client.Histogram({
    name: 'api_response_time_duration_seconds_publisher_api',
    help: 'REST API response time in seconds for Publisher, External API',
    labelNames: ['method', 'route', 'publ', 'status_code']
})
//METRICS FOR UI
//Metrics for User Interface - total
export const uiResponseTimeTotalHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_total',
    help: 'User Interface response time total requests',
    labelNames: ['method', 'route']
})
//Metrics for User Interface - total - failed
export const uiResponseTimeTotalFailedHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_total_failed',
    help: 'User Interface response time total failed requests',
    labelNames: ['method', 'route']
})
//Metrics for User Interface - user - failed
export const uiResponseTimeUserFailedHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_user_failed',
    help: 'User Interface response time total user failed requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for User Interface - zero elastic results
export const uiResponseTimeZeroElasticResultsHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_zero_elastic_results',
    help: 'User Interface response time total zero elastic results',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for User Interface - system - failed
export const uiResponseTimeSystemFailedHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_system_failed',
    help: 'User Interface response time total system failed requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for User Interface - total - success
export const uiResponseTimeTotalSuccessHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_total_success',
    help: 'User Interface response time total successful requests',
    labelNames: ['method', 'route']
})
//Metrics for User Interface - all
export const uiResponseTimeAllHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_all',
    help: 'User Interface response time in ms for all requests',
    labelNames: ['method', 'route', 'status_code']
})
//Metrics for User Interface - language
export const uiResponseTimeLangHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_language',
    help: 'User Interface response time in seconds for Language',
    labelNames: ['method', 'route', 'lang', 'status_code']
})
//Metrics for User Interface - publisher
export const uiResponseTimePublisherHistogram = new client.Histogram({
    name: 'ui_response_time_duration_seconds_publisher_api',
    help: 'User Interface response time in seconds for Publisher, External API',
    labelNames: ['method', 'route', 'publ', 'status_code']
})

//Endpoint used for Prometheus Metrics
export function startMetricsListening() {

    const router = express.Router();

    client.collectDefaultMetrics(); //general cpu, mem, etc information

    router.get('/metrics', async (_req, res) => 
      res.type(client.register.contentType).send(await client.register.metrics())
    );

    return router;
}

export function uiResponseTimeHandler(req: Request, res: Response, time: number) {
  if (req.query.size === undefined && req.headers.referer!==undefined) { //to exclude calls to _search?size=... etc & not log metrics from internal ES API
    //hits result from elastic search
    //FIXME: should be an import
    const moduleHits = require('./helper');
    const hits = moduleHits.hits;

    //ALL
    if (req?.route?.path) {
      uiResponseTimeAllHistogram.observe({
        method: req.method,
        route: req.route.path,
        status_code: res.statusCode
      }, time);
      uiResponseTimeTotalHistogram.observe({
        method: req.method,
        route: req.route.path
      }, time);

      //LANG
      const langUI: any = req.params;
      const lang = langUI.slice(9);
      uiResponseTimeLangHistogram.observe({
        method: req.method,
        route: req.route.path,
        lang: lang,
        status_code: res.statusCode
      }, time);

      //PUBLISHER
      const urlUI = new URL(String(req.headers.referer));
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

      if (res.statusCode >= 400) {
        //TOTAL FAILED REQUEST COUNTER
        uiResponseTimeTotalFailedHistogram.observe({
          method: req.method,
          route: req.route.path
        }, time);

        if (res.statusCode >= 500) {
          //SYSTEM FAIL REQUEST
          uiResponseTimeSystemFailedHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
          }, time);
        } else {
          //USER FAIL REQUEST
          uiResponseTimeUserFailedHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
          }, time);
        }

      } else {
        if (hits != 0) {
          //SUCCESS REQUEST
          uiResponseTimeTotalSuccessHistogram.observe({
            method: req.method,
            route: req.route.path
          }, time);
        }
      }
    }
  }
}

export function apiResponseTimeHandler(req: Request, res: Response, time: number) {
  //ALL
  if (req?.route?.path) {
    apiResponseTimeAllHistogram.observe({
      method: req.method,
      route: req.route.path,
      status_code: res.statusCode
    }, time);
    apiResponseTimeTotalHistogram.observe({
      method: req.method,
      route: req.route.path
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
    if (res.statusCode >= 400) {
      //TOTAL FAILED REQUEST COUNTER
      apiResponseTimeTotalFailedHistogram.observe({
        method: req.method,
        route: req.route.path
      }, time);

      if (res.statusCode >= 500) {
        //SYSTEM FAIL REQUEST
        apiResponseTimeSystemFailedHistogram.observe({
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode
        }, time);
      } else {
        //USER FAIL REQUEST
        apiResponseTimeUserFailedHistogram.observe({
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode
        }, time);
      }
    } else {
      //SUCCESS REQUEST
      apiResponseTimeTotalSuccessHistogram.observe({
        method: req.method,
        route: req.route.path
      }, time);
    }
  }
}

function observePublisher(req: Request, value: string, statusCode: number, time: number) {
    return apiResponseTimePublisherHistogram.observe({
        method: req.method,
        route: req.route.path,
        publ: value,
        status_code: statusCode
    }, time);
}
