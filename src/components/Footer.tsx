/* eslint-disable react/display-name */
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

import React from 'react';
import { Link } from 'react-router';
import Translate from 'react-translate-component';
import { Organization, WithContext } from 'schema-dts';
import counterpart from 'counterpart';

const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CESSDA ERIC",
  url: "https://www.cessda.eu",
  sameAs: [
    "https://twitter.com/CESSDA_Data",
    "https://www.linkedin.com/company/9392869",
    "https://www.youtube.com/channel/UCqbZKb1Enh-WcFpg6t86wsA"
  ]
};

const organizationJSON = JSON.stringify(organization);

export default () => (
  <footer>
    <section className="hero">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column is-4">
              <a href="https://cessda.eu" target="_blank" rel="noreferrer" aria-label={counterpart.translate("footer.mainWebsite")}>
                <svg id="footerlogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 189 56" aria-hidden="true">
                  <path className="ssst0" d="M79.29 41.35h-7.05c-3.99 0-7.24-3.24-7.24-7.23V22.34c0-3.99 3.25-7.23 7.24-7.23l7.05-.03h.01c.74 0 1.34.6 1.35 1.34 0 .74-.6 1.35-1.34 1.35l-7.05.03c-2.51 0-4.55 2.03-4.55 4.53v11.78c0 2.5 2.04 4.54 4.55 4.54h7.05c.74 0 1.35.6 1.35 1.35-.03.74-.63 1.35-1.37 1.35M99.17 41.37H90.8c-3.99 0-7.24-3.25-7.24-7.24V22.34c0-3.99 3.25-7.24 7.24-7.24h3.37c3.99 0 7.24 3.25 7.24 7.24v6.55h-12.6a1.35 1.35 0 0 1 0-2.7h9.9v-3.85c0-2.51-2.04-4.54-4.55-4.54H90.8c-2.51 0-4.54 2.04-4.54 4.54v11.79c0 2.51 2.04 4.54 4.54 4.54h8.37c.74 0 1.35.6 1.35 1.35-.01.75-.61 1.35-1.35 1.35M178.26 41.23h-4.17c-2 0-3.86-.98-5.23-2.76-1.29-1.68-2.01-3.9-2.01-6.26 0-4.78 2.98-8.11 7.24-8.11h5.93a1.35 1.35 0 0 1 0 2.7h-5.93c-2.72 0-4.55 2.18-4.55 5.42 0 3.49 2.04 6.33 4.55 6.33h4.17c2.51 0 4.55-2.04 4.55-4.54V22.2c0-2.5-2.04-4.54-4.55-4.54h-7.77a1.35 1.35 0 0 1 0-2.7h7.77c3.99 0 7.24 3.25 7.24 7.24V34c0 3.99-3.25 7.23-7.24 7.23M155.9 41.37h-4.26c-3.99 0-7.24-3.25-7.24-7.24v-11.8c0-3.99 3.25-7.24 7.24-7.24h6.04a1.35 1.35 0 0 1 0 2.7h-6.04c-2.51 0-4.55 2.04-4.55 4.54v11.8c0 2.51 2.04 4.54 4.55 4.54h4.26c2.51 0 4.55-2.04 4.55-4.54V4.66a1.35 1.35 0 0 1 2.7 0v29.47c-.01 3.99-3.26 7.24-7.25 7.24M114.66 41.37h-7.72a1.35 1.35 0 0 1 0-2.7h7.72c2.41 0 4.38-1.96 4.38-4.37 0-2.07-1.47-3.87-3.5-4.29l-3.77-.78c-.6-.11-1.46-.36-1.72-.46-2.72-1.04-4.55-3.69-4.55-6.6 0-3.9 3.17-7.07 7.07-7.07h5.83a1.35 1.35 0 0 1 0 2.7h-5.83c-2.41 0-4.38 1.96-4.38 4.37 0 1.8 1.13 3.44 2.81 4.09.13.05.81.25 1.25.33l.04.01 3.79.79c3.27.67 5.65 3.58 5.65 6.92 0 3.89-3.17 7.06-7.07 7.06M133.51 41.37h-7.72a1.35 1.35 0 0 1 0-2.7h7.72c2.41 0 4.38-1.96 4.38-4.37 0-2.07-1.47-3.87-3.5-4.29l-3.77-.78c-.6-.11-1.45-.36-1.72-.46-2.72-1.04-4.55-3.69-4.55-6.6 0-3.9 3.17-7.07 7.07-7.07h5.83a1.35 1.35 0 0 1 0 2.7h-5.83c-2.41 0-4.38 1.96-4.38 4.37 0 1.8 1.13 3.44 2.81 4.09.13.05.81.25 1.25.33l.04.01 3.79.79c3.27.67 5.65 3.58 5.65 6.92 0 3.89-3.17 7.06-7.07 7.06M32.49 27.99c0 2.29-1.85 4.14-4.14 4.14-2.29 0-4.14-1.85-4.14-4.14 0-2.29 1.85-4.14 4.14-4.14 2.28 0 4.14 1.85 4.14 4.14"></path>
                  <path className="ssst0" d="M35.62 11.38c.91-.9 2.12-1.4 3.41-1.4.61 0 1.2.12 1.75.33L37.26 6.8c-2.02-2.01-4.56-3.28-7.37-3.65-.58-.08-1.16-.11-1.73-.11-3.44 0-6.67 1.34-9.09 3.76L7.14 18.73c-.3.3-.59.62-.86.95-1.89 2.29-2.91 5.15-2.91 8.16 0 3.44 1.34 6.67 3.77 9.1l2.88 2.88.61.61v-.01l3.4 3.4c.45.45.98.77 1.55.99l.04.04c.06.02.13.03.19.05.06.02.11.03.17.05.19.05.39.1.59.13h.05c.18.02.35.05.53.05 1.18 0 2.29-.46 3.12-1.28l.01-.01c.01-.01.02-.01.02-.02.84-.84 1.3-1.95 1.3-3.13s-.46-2.3-1.3-3.13l-3.85-3.85-3.03-3.05a3.995 3.995 0 0 1-1.18-2.84c0-.83.25-1.62.72-2.29.13-.18.27-.36.43-.53l5.88-5.88 6.06-6.07c.75-.75 1.76-1.17 2.83-1.17s2.08.42 2.84 1.17l3.53 3.52c-.22-.56-.34-1.16-.33-1.78-.01-1.28.5-2.49 1.42-3.41"></path>
                  <path className="ssst0" d="M49.29 18.87l-6.94-6.99a4.404 4.404 0 0 0-3.11-1.27c-1.18 0-2.29.46-3.12 1.28-.84.83-1.31 1.95-1.31 3.13-.01 1.18.45 2.3 1.29 3.14l6.92 6.97c.76.76 1.18 1.77 1.18 2.84 0 1.07-.41 2.08-1.16 2.83L31.1 42.73c-.75.75-1.76 1.17-2.83 1.17s-2.08-.42-2.84-1.17l-3.49-3.49c.2.54.32 1.12.32 1.71 0 1.29-.5 2.51-1.42 3.43-.91.92-2.13 1.42-3.43 1.42a4.603 4.603 0 0 1-1.82-.36l3.57 3.57c2.02 2.01 4.56 3.28 7.37 3.65.57.08 1.15.11 1.73.11 3.44 0 6.67-1.33 9.09-3.76L49.3 37.06c2.42-2.43 3.76-5.66 3.76-9.1s-1.35-6.67-3.77-9.09"></path>
                </svg>
              </a>
            </div>

            <div className="column is-8 blinks">
              <a href="/documentation/" target="_blank" className="is-inline-block">User Guide</a> | <Link to="/about/" className="is-inline-block">About</Link> | <a href="https://www.cessda.eu/Privacy-policy" target="_blank" rel="noreferrer" className="is-inline-block"><Translate content="footer.privacy" /></a> | <a href="https://www.cessda.eu/Acceptable-Use-Policy" target="_blank" rel="noreferrer" className="is-inline-block"><Translate content="footer.aup" /></a> | <Link to="/accessibility-statement/" className="is-inline-block">Accessibility Statement</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    <script type="application/ld+json">
      {organizationJSON}
    </script>
  </footer>
);
