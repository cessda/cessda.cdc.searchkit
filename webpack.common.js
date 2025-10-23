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

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type webpack.Configuration */
module.exports = {
  context: path.join(__dirname),
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    },
    extensions: ['.ts', '.tsx', '.json', '.js', '.jsx', '.webpack.js', '.web.js'],
    fallback: {
      util: require.resolve("util/")
    }
  },
  module: {
    rules: [{
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    }, {
      test: /\.(ts|js)x?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      options: {
        plugins: [
          'transform-react-remove-prop-types'
        ]
      }
    }, {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }, {
      test: /\.(scss|sass)$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }]
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      type: 'asset/resource'
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource'
    },
  
  ]
  }, 
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ]
};
