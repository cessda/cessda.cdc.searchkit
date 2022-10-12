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

import React, { Component } from 'react';
import { Layout, LayoutBody, LayoutResults, SearchkitProvider } from 'searchkit';
import Header from '../components/Header';
import Footer from '../components/Footer';
import searchkit from '../utilities/searchkit';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';
import { Link } from 'react-router';

export class AboutPage extends Component {

  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <Header/>
          <div className="container">
            <LayoutBody className="columns">
              <LayoutResults className="not-found-layout">
                <article className="not-found-container">
                  <Translate component="h1" className="not-found-title" content="notFound.label" />
                  <Translate content="notFound.content" unsafe />
                </article>
              </LayoutResults>
            </LayoutBody>
            <div className="columns not-found-links">
              <div className="column is-full blinks">
                <Link to="/">Return to the home page</Link> | <a href="https://www.cessda.eu">CESSDA main website</a>
              </div>
            </div>
          </div>
          <Footer/>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default connect()(AboutPage);
