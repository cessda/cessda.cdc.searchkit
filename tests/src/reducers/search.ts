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

import { getStudyModel } from '../../../common/metadata';
import { INIT_SEARCHKIT } from '../../../src/actions/search';
import search from '../../../src/reducers/search';
import { queryBuilder } from '../../../src/utilities/searchkit';
import { mockStudy } from '../../common/mockdata';

const initialState = search(undefined, { type: INIT_SEARCHKIT });

describe('Search reducer', () => {
  it('should return the initial state', () => {
    // @ts-expect-error - allow testing using an undefined type
    expect(search(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle INIT_SEARCHKIT', () => {
    expect(
      search(
        initialState,
        {
          type: 'INIT_SEARCHKIT'
        }
      )
    ).toEqual(initialState);
  });

  it('should handle TOGGLE_LOADING', () => {
    expect(
      search(
        {
          ...initialState,
          loading: false
        },
        {
          type: 'TOGGLE_LOADING',
          loading: true
        }
      )
    ).toEqual({
      ...initialState,
      loading: true
    });
  });

  it('should handle TOGGLE_MOBILE_FILTERS', () => {
    expect(
      search(
        {
          ...initialState,
          showMobileFilters: false
        },
        {
          type: 'TOGGLE_MOBILE_FILTERS'
        }
      )
    ).toEqual({
      ...initialState,
      showMobileFilters: true
    });
  });

  it('should handle TOGGLE_ADVANCED_SEARCH', () => {
    expect(
      search(
        {
          ...initialState,
          showAdvancedSearch: false
        },
        {
          type: 'TOGGLE_ADVANCED_SEARCH'
        }
      )
    ).toEqual({
      ...initialState,
      showAdvancedSearch: true
    });
  });

  it('should handle TOGGLE_SUMMARY', () => {
    expect(
      search(
        {
          ...initialState,
          showFilterSummary: false
        },
        {
          type: 'TOGGLE_SUMMARY'
        }
      )
    ).toEqual({
      ...initialState,
      showFilterSummary: true
    });
  });

  it('should handle TOGGLE_METADATA_PANELS', () => {
    expect(
      search(
        {
          ...initialState,
          expandMetadataPanels: false
        },
        {
          type: 'TOGGLE_METADATA_PANELS'
        }
      )
    ).toEqual({
      ...initialState,
      expandMetadataPanels: true
    });
  });

  it('should handle UPDATE_DISPLAYED', () => {
    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: []
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [],
      jsonLd: undefined
    });

    const emptyStudy = getStudyModel({});

    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: [emptyStudy]
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [emptyStudy]
    });

    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: [
            mockStudy
          ]
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [
        mockStudy
      ]
    });
  });

  it('should handle UPDATE_QUERY', () => {
    // Mock searchkit query.
    const query = {
      index: 'cmmstudy_en',
      query: {
        bool: {
          must: [queryBuilder('search text')]
        }
      }
    };

    expect(
      search(
        {
          ...initialState,
          query: {}
        },
        {
          type: 'UPDATE_QUERY',
          query: query
        }
      )
    ).toEqual({
      ...initialState,
      query: query
    });
  });

  it('should handle UPDATE_STATE', () => {
    // Mock searchkit state.
    const state = {
      q: 'search text'
    };

    expect(
      search(
        {
          ...initialState,
          state: { q: '' }
        },
        {
          type: 'UPDATE_STATE',
          state: state
        }
      )
    ).toEqual({
      ...initialState,
      state: state
    });
  });

  it('should handle RESET_SEARCH', () => {
    const state = initialState;
    expect(
      search(state, {
        type: 'RESET_SEARCH'
      })
    ).toEqual(state);
  });

  it('should handle unknown action type', () => {
    const state = initialState;
    //@ts-expect-error - allow sending an empty action
    expect(search(state, {})).toEqual(state);
  });
});
