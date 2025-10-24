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
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';
import config from '../webpack.dev.config.js';
import path from 'path';
import { checkEnvironmentVariables, renderResponse, startListening } from './helper';
import { logger } from './logger';

export function start() {
  checkEnvironmentVariables(false);

  // Configure Webpack compiler
  const compiler = webpack(config);
  if (!compiler) {
    logger.error("Unable to start Data Catalogue application. Webpack compiler configuration failed.");
    process.exitCode = 1;
    return;
  }

  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../dist'));

  app.use(webpackMiddleware(compiler, {
    publicPath: config.output?.publicPath,
    index: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    },
    // Write the index.ejs file to disk so that ejs can access it
    writeToDisk: (filePath) => /index.dev.ejs/.test(filePath)
  }));

  app.use(webpackHotMiddleware(compiler));
  
  // Start listening
  startListening(app, async (req, res) => {
    const ejsTemplate = 'index.dev.ejs';
    res.setHeader('Cache-Control', 'no-store');
    await renderResponse(req, res, ejsTemplate);
  });
}
