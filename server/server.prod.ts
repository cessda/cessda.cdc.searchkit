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
import express from 'express';
import path from 'path';
import { checkBuildDirectory, checkEnvironmentVariables, renderResponse, startListening } from './helper';

export function start () {
    checkBuildDirectory();
    checkEnvironmentVariables(true);

    const app = express();

    // Disable X-Powered-By in production
    app.disable('x-powered-by');

    app.set('view engine', 'ejs');
    app.use('/static', express.static(path.join(__dirname, '../dist'), { fallthrough: false }));

    const indexPath = path.join(path.join(__dirname, '../dist'), 'index.ejs');

    startListening(app, async (req, res) => await renderResponse(req, res, indexPath));
};

