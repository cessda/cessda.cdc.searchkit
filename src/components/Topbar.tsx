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
import { ActionBar, ActionBarRow } from 'searchkit';
import counterpart from 'counterpart';
import SortingSelector from './SortingSelector';
import PageSizeSelector from './PageSizeSelector';

export default () => (
  <ActionBar>
    <ActionBarRow>
      <div className="level is-mobile">
        <div className="level-left">
          <label className="level-item">
            {counterpart.translate('resultsPerPage')}
            <PageSizeSelector className="level-item" options={[10, 30, 50, 150]} />
          </label>
        </div>

        <div className="level-right">
          <label className="level-item">
            {counterpart.translate('sortBy')}
            <SortingSelector className="level-item" options={[{
              label: counterpart.translate('sorting.relevance'),
              key: 'relevance',
              field: '_score',
              order: 'desc',
              defaultOption: true
            }, {
              label: counterpart.translate('sorting.titleAscending'),
              key: 'title-ascending',
              field: 'titleStudy.normalized',
              order: 'asc',
              defaultOption: false
            }, {
              label: counterpart.translate('sorting.titleDescending'),
              key: 'title-descending',
              field: 'titleStudy.normalized',
              order: 'desc',
              defaultOption: false
            }, {
              label: counterpart.translate('sorting.dateAscending'),
              key: 'date-ascending',
              field: 'dataCollectionPeriodEnddate',
              order: 'asc',
              defaultOption: false
            }, {
              label: counterpart.translate('sorting.dateDescending'),
              key: 'date-descending',
              field: 'dataCollectionPeriodEnddate',
              order: 'desc',
              defaultOption: false
            }, {
              label: counterpart.translate('sorting.publicationDateDescending'),
              key: 'publication-date-descending',
              field: 'publicationYear',
              order: 'desc',
              defaultOption: false
            }]} />
          </label>
        </div>
      </div>
    </ActionBarRow>
  </ActionBar>
);

