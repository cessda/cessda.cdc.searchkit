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

import winston from "winston";

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
export const logger = winston.createLogger({
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
