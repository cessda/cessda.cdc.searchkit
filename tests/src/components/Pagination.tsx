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

import React from 'react';
import Pagination from '../../../src/components/Pagination';
import { render } from '../../testutils';
import { InstantSearch } from 'react-instantsearch';
import searchClient from '../../../src/utilities/searchkit';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';

jest.mock('../../../src/utilities/searchkit', () => ({
  __esModule: true,
  default: {
    search: jest.fn().mockResolvedValue({
      results: [
        {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: '',
          params: '',
        },
      ],
    }),
    searchForFacetValues: jest.fn().mockResolvedValue([]),
  },
}));

describe('Pagination', () => {
  it('renders without crashing', async () => {
    const { container } = render(
      <InstantSearch indexName="test_index" searchClient={searchClient}>
        <Pagination />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-Pagination')).toBeInTheDocument();
    });
  });
});
