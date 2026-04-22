/* eslint-disable @typescript-eslint/no-require-imports */
// Copyright CESSDA ERIC 2017-2026
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

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import './i18n/config';
import "./styles/design.scss";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";
import getPaq from "./utilities/getPaq";

// Import images used by Open Graph
require('./img/cessda_logo_dc.png')

// Initialise Matomo Analytics.
const _paq = getPaq();
const url = 'https://cessda.matomo.cloud/';
const siteId = '2';

_paq.push(['setTrackerUrl', url + 'matomo.php']);
_paq.push(['setSiteId', siteId]);

const element = document.createElement('script');
const script = document.getElementsByTagName('script')[0];

element.type = 'text/javascript';
element.async = true;
element.defer = true;
element.src = url + 'matomo.js';

if (script?.parentNode) {
  script.parentNode.insertBefore(element, script);
}

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <HelmetProvider>  
    <Provider store={store}>
      <App />
    </Provider>
  </HelmetProvider>
);
