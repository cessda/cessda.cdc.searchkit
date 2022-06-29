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

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  context: path.join(__dirname),
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    },
    extensions: ['.ts', '.tsx', '.json', '.js', '.jsx', '.webpack.js', '.web.js']
  },
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
            quality: [0.75, 0.90],
            speed: 3
          }
        }
      }]
    }]
  }
};
