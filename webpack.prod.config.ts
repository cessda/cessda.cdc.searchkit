// @ts-check
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
import common from './webpack.common';
import { join } from 'path';
import { merge } from 'webpack-merge';
import { optimize, DefinePlugin, EnvironmentPlugin } from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default merge(common, {
  mode: 'production',
  entry: [
    './src/index.tsx'
  ],
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].[contenthash].bundle.js',
    publicPath: '/static/',
    assetModuleFilename: 'img/[name][ext]'
  },
  optimization: {
    chunkIds: 'total-size',
    moduleIds: 'size',
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new optimize.AggressiveMergingPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: '!!html-loader!server/views/index.ejs',
      filename: 'index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new EnvironmentPlugin({
      PASC_DEBUG_MODE: false,
      PASC_PORT: 8088,
      PASC_ELASTICSEARCH_URL: null
    })
  ],
  module: {
    rules: [{
      test: /\.(ts|js)x?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      options: {
        plugins: [
          'transform-react-remove-prop-types'
        ]
      }
    }]
  }
});
