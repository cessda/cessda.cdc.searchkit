// Copyright CESSDA ERIC 2017-2025
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

const DynamicUserGuidePage = () => {
  return (
    <div className="columns is-justify-content-center">
      <div className="column p-6">
        <div className="text-container">
          <h1 className="main-title mb-4">User Guide - COORDINATE Portal</h1>
          <p>Brief usage instructions follow below. For detailed documentation and examples, see the complete <a href="/documentation/" target="_blank" rel="noreferrer"><strong>user documentation</strong></a>.</p>

          <h2>Scope</h2>
          <p>The COORDINATE Portal contains a subset of the study descriptions available in the CESSDA Data Catalogue (CDC), on the topics of child and youth wellbeing.</p>

          <h2>Searching</h2>
          <p>Use the search bar at the top to find studies with descriptions in the selected language (English is the default). Use the dropdown beside the search field to select another language.</p>

          <h2>Filtering</h2>
          <p>
            The system allows filtering by several criteria. Expand the filters by clicking the arrow beside the criterion (such as &quot;Topic&quot;) and select one or more terms. Filters can be combined, and the number beside the filter displays the approximate number of studies matching it.
          </p>
          <p>
            If filters have been selected, you can click &quot;Summary&quot; to view the currently applied filters and &quot;Reset&quot; to remove all filters.
          </p>
          <h2>Study details</h2>
          <p>
            Clicking on a study title (highlighted in blue) within the results list will take you to the study view with more detailed information and links.
          </p>
          <p>
            Below the abstract section, you will often find associated topics and keywords. Selecting one of these will perform a search on that particular term.
          </p>
          <h2>Other collections</h2>
          <p>
            Beside the logo at top left there is a dropdown for selecting a specific collection of studies. These are a subset of the studies available in the CDC, selected according to a thematic set of criteria. See the <a href="collections">Collections</a> page for a description of available thematic views.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicUserGuidePage;
