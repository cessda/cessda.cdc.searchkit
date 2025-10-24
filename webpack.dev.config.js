/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check
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
const common = require('./webpack.common');
const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type webpack.Configuration */
module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/index.tsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: '!!html-loader!server/views/index.ejs',
      filename: 'index.dev.ejs'
    }),
    new webpack.EnvironmentPlugin({
      PASC_DEBUG_MODE: false,
      PASC_PORT: 8088,
      PASC_ELASTICSEARCH_URL: null
    })
  ]
});
