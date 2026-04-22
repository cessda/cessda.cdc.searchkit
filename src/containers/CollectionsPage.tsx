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
import { thematicViews } from "../../common/thematicViews";
import { Helmet } from "react-helmet-async";
import { useResetToThematicView } from "../utilities/thematicView";
import { iconMap } from "../img/icons/iconMap";

const CollectionsPage = () => {
  const resetToView = useResetToThematicView();

  return (
    <div className="columns">
      <Helmet>
        <title>CESSDA Data Catalogue - Collections</title>
      </Helmet>

      <div className="content-wrapper column is-8 is-offset-2 mt-6 p-6">
        <h1 className="main-title mb-4">Collections</h1>
        <p>
          The CESSDA Data Catalogue (CDC) provides collections (thematic views) on specific topics and issues.
        </p>

        <div className="columns is-flex-wrap-wrap mt-2">
          {thematicViews.map((tv, i) => (
            <div key={i} className="column is-full is-half-desktop">
              <div className="collection-card">
                <a
                  href={tv.path}
                  onClick={(e) => {
                    e.preventDefault();
                    resetToView(tv);
                  }}
                >
                  <div className="has-text-centered">
                    <img
                      src={iconMap[tv.icon]}
                      alt={tv.longTitle}
                      className="pt-2 collIcon"
                    />
                  </div>
                  <h2>{tv.longTitle}</h2>
                  <p>{tv.listDescription}</p>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
