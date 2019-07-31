// Copyright CESSDA ERIC 2017-2019
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
process.noDeprecation = true;
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: path.join(__dirname),
  entry: [
    'babel-polyfill',
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      warnings: false,
      output: {
        comments: false
      },
      compress: {
        warnings: false,
        drop_console: true
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'server/views/index.ejs'),
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.EnvironmentPlugin({
      PASC_DEBUG_MODE: false,
      PASC_PORT: 8088,
      PASC_ELASTICSEARCH_URL: null,
      PASC_ENABLE_ANALYTICS: false
    })
  ],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    },
    extensions: ['.js', '.jsx', '.webpack.js', '.web.js', '.json']
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          ['es2015', {modules: false}],
          'react',
          'flow'
        ],
        plugins: [
          'transform-react-remove-prop-types'
        ]
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
      {
        test: /\.(scss|sass)$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: ['file-loader?context=src/images&name=images/[path][name].[ext]', {
          loader: 'image-webpack-loader',
          query: {
            mozjpeg: {
              progressive: true
            },
            gifsicle: {
              interlaced: false
            },
            optipng: {
              optimizationLevel: 4
            },
            pngquant: {
              quality: '75-90',
              speed: 3
            }
          }
        }]
        // exclude: /node_modules/,
      }]
  }
};
