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

export class AboutPage extends Component {

  componentDidMount() {
    document.title = `${counterpart.translate('about.label')} - ${counterpart.translate('datacatalogue')}`;

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
          <main className="container">
          <LayoutBody className="columns">
            <LayoutResults>
              <article className="about-container">
                <Translate component="h1" className="about-title" content="about.label"/>
                <Translate content="about.content" unsafe/>
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

export default connect()(AboutPage);
