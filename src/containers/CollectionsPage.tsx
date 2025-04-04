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

import React from "react";
import { thematicViews, ThematicView } from "../utilities/thematicViews"
import { Helmet } from "react-helmet-async";

const CollectionsPage = () => {
  return (
    <div className="columns">
      <Helmet>
                    <title>CESSDA Data Catalogue - Collections</title>
                    </Helmet>
      <div className="content-wrapper column is-8 is-offset-2 mt-6 p-6">
        <h1 className="main-title mb-4">Collections</h1>
        <p>
          The CESSDA Data Catalogue (CDC) provides collections (thematic views) on specific topics and issues. These are a subset of the CDC itself, and have a more focused searching and browsing experience. Choose a collection from below or use the dropdown at the top.
        </p>
        <div className="columns is-flex-wrap-wrap mt-2">
          {
            thematicViews.map(({ longTitle, icon, path, listDescription, url }: any) =>
              <div className="column is-full is-half-desktop">
                <div className="collection-card">
                <a href={path}>
                 <div className="has-text-centered">
                <img src={require('../img/icons/' + icon)} alt={longTitle} className="pt-2 collIcon"></img>
                </div>
                <h2>{longTitle}</h2>
               
                <p>
                  {listDescription}
                </p>
                </a>
              </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;