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

import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import searchkit, { queryBuilder } from '../../../src/utilities/searchkit';
import {
  initSearchkit,
  INIT_SEARCHKIT,
  resetSearch,
  RESET_SEARCH,
  toggleAdvancedSearch,
  toggleLoading,
  toggleMetadataPanels,
  toggleMobileFilters,
  toggleSummary,
  TOGGLE_ADVANCED_SEARCH,
  TOGGLE_LOADING,
  TOGGLE_METADATA_PANELS,
  TOGGLE_MOBILE_FILTERS,
  TOGGLE_SUMMARY,
  updateDisplayed,
  updateQuery,
  updateState,
  UPDATE_DISPLAYED,
  UPDATE_QUERY,
  UPDATE_STATE
} from '../../../src/actions/search';
import { languages } from '../../../src/utilities/language';
import _ from 'lodash';
import { State } from '../../../src/types';
import { AnyAction } from 'redux';
import { enLanguage } from '../utilities/language';
import { getStudyModel } from '../../../common/metadata';

const mockStore = configureMockStore<Partial<State>, ThunkDispatch<State, never, AnyAction>>([thunk]);


// Create a SearchkitManager with an instant timeout.
jest.mock('../../src/utilities/searchkit', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/utilities/searchkit'),
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  default: new (require('searchkit').SearchkitManager)('api/sk', { timeout: 0 })
}));

describe('Search actions', () => {

  beforeEach(() => {
    // Reset environment variables.
    process.env.PASC_DEBUG_MODE = 'false';

    // Manually initialise searchkit history.
    searchkit.history = {
      location: {
        search: '?q=search%20text'
      },
      push: () => {
        // Mocked method stub.
      }
    };

    // Mock Matomo Analytics library (no metrics will actually be sent).
    // @ts-expect-error - mocking the global _paq object
    global['_paq'] = [];
  });

  afterEach(() => {
    // Reset mocked modules.
    jest.resetModules();
  });

  describe('INIT_SEARCHKIT action', () => {
    // Action uses setTimeout() so use fake timers for these tests.
    beforeEach(() => jest.useFakeTimers());

    it('is created when initialising searchkit on the results page', () => {
      // Mock Redux store.
      const store = mockStore({
        routing: {
          // @ts-expect-error - only parameters required by the test are provided
          locationBeforeTransitions: {
            pathname: '/',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          currentLanguage: enLanguage,
          list: _.map(languages, (language) => _.pick(language, ['code', 'label', 'index']))
        }
      });

      // Dispatch action.
      store.dispatch(initSearchkit());

      // Manually trigger search to execute query processor.
      searchkit.search();

      // Execute second search to check init flag in setTimeout() callback.
      searchkit.search();

      // Manually execute setTimeout() callback.
      jest.runAllTimers();

      // Manually set search results to execute results listener.
      searchkit.setResults({
        aggregations: {},
        hits: {
          hits: [],
          total: 0
        },
        timed_out: false,
        took: 1
      });

      // State should contain actions in sequence for results page.
      expect(store.getActions()).toEqual([
        {
          type: INIT_SEARCHKIT
        },
        {
          type: TOGGLE_LOADING,
          loading: true
        },
        {
          type: UPDATE_QUERY,
          query: {
            index: enLanguage.index,
            min_score: 0.5,
            size: 20,
            track_total_hits: true
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        },
        {
          type: TOGGLE_LOADING,
          loading: true
        },
        {
          type: UPDATE_QUERY,
          query: {
            index: enLanguage.index,
            min_score: 0.5,
            size: 20,
            track_total_hits: true
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        },
        {
          type: UPDATE_DISPLAYED,
          displayed: []
        },
        {
          type: TOGGLE_LOADING,
          loading: false
        }
      ]);
    });

    it('is created when initialising searchkit on the detail page', () => {
      // Mock Redux store.
      const store = mockStore({
        routing: {
          // @ts-expect-error - only parameters required by the test are provided
          locationBeforeTransitions: {
            pathname: '/detail',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          currentLanguage: enLanguage,
          list: languages
        }
      });

      // Dispatch action.
      store.dispatch(initSearchkit());

      // Manually trigger search to execute query processor.
      searchkit.search();

      // Manually execute setTimeout() callback.
      jest.runAllTimers();

      // Manually set search results to execute results listener.
      searchkit.setResults({
        aggregations: {},
        hits: {
          hits: [
            {
              _source: {
                id: "1"
              }
            }
          ],
          total: 1
        },
        timed_out: false,
        took: 1
      });

      // State should contain actions in sequence for detail page.
      expect(store.getActions()).toEqual([
        {
          type: INIT_SEARCHKIT
        },
        {
          type: TOGGLE_LOADING,
          loading: true
        },
        {
          type: UPDATE_QUERY,
          query: {
            index: 'cmmstudy_en',
            query: {
              ids: {
                values: ['search text']
              }
            },
            size: 20,
            track_total_hits: true
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        },
        {
          type: UPDATE_DISPLAYED,
          displayed: [getStudyModel({ id: "1" })],
        },
        {
          type: TOGGLE_LOADING,
          loading: false
        }
      ]);
    });

    it('logs user metrics when analytics is enabled', () => {
      // Mock Redux store.
      const store = mockStore({
        routing: {
          // @ts-expect-error - only parameters required by the test are provided
          locationBeforeTransitions: {
            pathname: '/',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          currentLanguage: enLanguage,
          list: languages
        }
      });

      // Dispatch action.
      store.dispatch(initSearchkit());

      // Manually trigger search to execute query processor.
      searchkit.search();

      // Analytics are not logged on initial query so must execute second search.
      searchkit.search();

      // Manually execute setTimeout() callback.
      jest.runAllTimers();

      // Analytics library should have pushed events.
      // @ts-expect-error - accessing the global _paq object
      expect(global['_paq']).toEqual([
        ['setReferrerUrl', '/?q=search%20text'],
        ['setCustomUrl', '/?q=search%20text'],
        ['setDocumentTitle', 'CESSDA Data Catalogue'],
        ['deleteCustomVariables', 'page'],
      //  ['setGenerationTimeMs', 0],
        ['trackPageView'],
        ['MediaAnalytics::scanForMedia', null],
        ['FormAnalytics::scanForForms', null],
        ['trackContentImpressionsWithinNode', null],
        ['enableLinkTracking']
      ]);
    });

    afterEach(() => jest.clearAllTimers());
  });

  describe('TOGGLE_LOADING action', () => {
    it('is created when application has started loading', () => {
      // Action should be returned with updated loading state.
      expect(toggleLoading(true)).toEqual({
        type: TOGGLE_LOADING,
        loading: true
      });
    });

    it('is created when application has finished loading', () => {
      // Action should be returned with updated loading state.
      expect(toggleLoading(false)).toEqual({
        type: TOGGLE_LOADING,
        loading: false
      });
    });
  });

  describe('TOGGLE_MOBILE_FILTERS action', () => {
    it('is created when mobile filter visibility changes', () => {
      // Action should be returned.
      expect(toggleMobileFilters()).toEqual({
        type: TOGGLE_MOBILE_FILTERS
      });
    });
  });

  describe('TOGGLE_ADVANCED_SEARCH action', () => {
    it('is created when advanced search visibility changes', () => {
      // Action should be returned.
      expect(toggleAdvancedSearch()).toEqual({
        type: TOGGLE_ADVANCED_SEARCH
      });
    });
  });

  describe('TOGGLE_SUMMARY action', () => {
    it('is created when filter summary visibility changes', () => {
      // Action should be returned.
      expect(toggleSummary()).toEqual({
        type: TOGGLE_SUMMARY
      });
    });
  });

  describe('TOGGLE_METADATA_PANELS action', () => {
    it('is created when metadata panel collapsed state changes', () => {
      // Action should be returned.
      expect(toggleMetadataPanels()).toEqual({
        type: TOGGLE_METADATA_PANELS
      });
    });
  });

  describe('UPDATE_DISPLAYED action', () => {
    it('is created when the list of displayed studies is updated', () => {
      // Mock Redux store.
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: []
        }
      });

      const minimalStudy = {
        id: "1"
      };

      // Dispatch action.
      store.dispatch(
        updateDisplayed({
          hits: {
            hits: [
              // @ts-expect-error - only parameters required by the test are provided
              {
                _source: minimalStudy
              }
            ]
          }
        })
      );

      // State should contain displayed studies and language.
      expect(store.getActions()).toEqual([
        {
          type: UPDATE_DISPLAYED,
          displayed: [
            getStudyModel(minimalStudy)
          ]
        }
      ]);
    });
  });

  describe('UPDATE_QUERY action', () => {
    it('is created when searchkit query changes', () => {
      // Mock searchkit query.
      const query = {
        index: 'cmmstudy_en',
        query: {
          bool: {
            must: [queryBuilder('search text')]
          }
        }
      };

      // Action should be returned with updated query.
      expect(updateQuery(query)).toEqual({
        type: UPDATE_QUERY,
        query: query
      });
    });
  });

  describe('UPDATE_STATE action', () => {
    it('is created when searchkit state changes', () => {
      // Mock searchkit state.
      const state = {
        q: 'search text'
      };

      // Action should be returned with updated state.
      expect(updateState(state)).toEqual({
        type: UPDATE_STATE,
        state: state
      });
    });
  });

  describe('RESET_SEARCH action', () => {
    // Action uses setTimeout() so use fake timers for these tests.
    beforeEach(() => jest.useFakeTimers());

    it('is created when the list of similar studies is updated', () => {
      // Mock Redux store.
      const store = mockStore({});

      // Dispatch action.
      store.dispatch(resetSearch());

      // Action should be returned.
      expect(store.getActions()).toEqual([
        {
          type: RESET_SEARCH
        }
      ]);
    });

    // Clear any pending timers
    afterEach(() => jest.clearAllTimers());
  });
});
