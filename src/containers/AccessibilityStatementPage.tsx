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
import { Helmet } from "react-helmet-async";

const AccessibilityStatementPage = () => {
  return (
    <div className="columns">
      <div className="content-wrapper column is-three-fifths is-offset-one-fifth mt-6 p-6">
        <article>
          <Helmet>
            <title>Accessibility Statement</title>
          </Helmet>
          <div className="columns is-flex-direction-column text-container">
            <div className="column mt-10">
              <h1 className="title is-4">Accessibility Statement</h1>
              <p>CESSDA is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.</p>
            </div>
            <div className="column">
              <h2 className="title is-5">Conformance status</h2>
              <p>The <a href='https://www.w3.org/WAI/standards-guidelines/wcag/' target='_blank' rel="noreferrer">Web Content Accessibility Guidelines (WCAG)</a> define requirements for designers and developers to improve accessibility for people with disabilities. They outline three levels of conformance: Level A, Level AA, and Level AAA. This data catalogue is conformant with WCAG 2.2 Level AA, meaning it meets most accessibility standards.</p>
            </div>
            <div className="column">
              <h2 className="title is-5">Feedback</h2>
              <p>For additional assistance or inquiries related to accessibility, please utilise our feedback form.</p>
            </div>
            <div className="column">
              <h2 className="title is-5">Compatibility with browsers and assistive technology</h2>
              <p>The data catalogue&apos;s accessibility features are currently undergoing testing primarily on Firefox and Chrome browsers. The screen reader mainly used in testing is NVDA. Other major browsers and screen readers should also be compatible, but some aspects of the website may not display optimally, especially when using older versions.</p>
            </div>
            <div className="column">
              <h2 className="title is-5">Assessment approach</h2>
              <p>CESSDA assessed the accessibility of the data catalogue by self-evaluation.</p>
            </div>
            <div className="column mb-10">
              <h2 className="title is-5">About the accessibility statement</h2>
              <p>The accessibility statement was first created on 23 August 2023 and last updated on 15 April 2026.</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default AccessibilityStatementPage;
