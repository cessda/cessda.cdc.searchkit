// Copyright CESSDA ERIC 2017-2023
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

import React, { Component } from 'react';
import { Layout, LayoutBody, LayoutResults, SearchkitProvider } from 'searchkit';
import Header from '../components/Header';
import Footer from '../components/Footer';
import searchkit from '../utilities/searchkit';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';
import counterpart from 'counterpart';

export class AccessibilityPage extends Component {

  componentDidMount() {
    document.title = `${counterpart.translate('accessibility.label')} - ${counterpart.translate('datacatalogue')}`;

    // Remove the JSON-LD representation if present
    const jsonLDElement = document.getElementById("json-ld");
    if (jsonLDElement) {
      jsonLDElement.remove();
    }
  }

  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <Header/>
          <main id="main" className="container">
            <LayoutBody className="columns">
              <LayoutResults>
                <article className="accessibility-container">
                  <div className="block mt-4">
                    <Translate content="accessibility.label" component="h1" className="title is-4"/>
                    <Translate content="accessibility.content.opening" component="p"/>
                  </div>
                  <div className="block">
                    <Translate content="accessibility.heading.conformance" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.conformance" component="p" unsafe/>
                  </div>
                  <div className="block">
                    <Translate content="accessibility.heading.nonAccessible" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.nonAccessible.paragraph" component="p"/>
                    <Translate content="accessibility.content.nonAccessible.subheading" component="h3" className="subtitle"/>
                    <Translate content="accessibility.content.nonAccessible.list" component="ul" unsafe/>
                  </div>
                  <div className="block">
                    <Translate content="accessibility.heading.feedback" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.feedback" component="p"/>
                  </div>
                  <div className="block">
                    <Translate content="accessibility.heading.compatibility" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.compatibility" component="p"/>
                  </div>
                  <div className="block">
                    <Translate content="accessibility.heading.assessment" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.assessment" component="p"/>
                  </div>
                  <div className="block mb-4">
                    <Translate content="accessibility.heading.about" component="h2" className="title is-5"/>
                    <Translate content="accessibility.content.about" component="p"/>
                  </div>
                </article>
              </LayoutResults>
            </LayoutBody>
          </main>
          <Footer/>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default connect()(AccessibilityPage);
