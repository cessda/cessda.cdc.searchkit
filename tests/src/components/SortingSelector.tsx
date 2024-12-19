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
import { shallow } from 'enzyme';
import SortingSelector from '../../../src/components/SortingSelector';
import searchkit from '../../../src/utilities/searchkit';

// Mock props and shallow render component for test.
function setup() {
  const props = {
    searchkit: searchkit,
    options: [
      {
        translation: 'sorting.relevance',
        label: '',
        key: 'relevance',
        field: '_score',
        order: 'desc',
        defaultOption: true
      },
      {
        translation: 'sorting.titleAscending',
        label: '',
        key: 'title-ascending',
        field: 'titleStudy.normalized',
        order: 'asc'
      },
      {
        translation: 'sorting.titleDescending',
        label: '',
        key: 'title-descending',
        field: 'titleStudy.normalized',
        order: 'desc'
      },
      {
        translation: 'sorting.dateAscending',
        label: '',
        key: 'date-ascending',
        field: 'dataCollectionPeriodStartdate',
        order: 'asc'
      },
      {
        translation: 'sorting.dateDescending',
        label: '',
        key: 'date-descending',
        field: 'dataCollectionPeriodStartdate',
        order: 'desc'
      }
    ]
  };
  const enzymeWrapper = shallow<SortingSelector>(<SortingSelector {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('SortingSelector component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.exists()).toBe(true);
  });

  it('should handle has hits', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.instance().hasHits()).toBe(true);
  });
});
