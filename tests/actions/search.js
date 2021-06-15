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
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import searchkit, { queryBuilder } from '../../src/utilities/searchkit';
import {
  initSearchkit,
  INIT_SEARCHKIT,
  resetSearch,
  RESET_SEARCH,
  toggleAdvancedSearch,
  toggleLoading,
  toggleLongAbstract,
  toggleMetadataPanels,
  toggleMobileFilters,
  toggleSummary,
  TOGGLE_ADVANCED_SEARCH,
  TOGGLE_LOADING,
  TOGGLE_LONG_DESCRIPTION,
  TOGGLE_METADATA_PANELS,
  TOGGLE_MOBILE_FILTERS,
  TOGGLE_SUMMARY,
  updateDisplayed,
  updateQuery,
  updateSimilars,
  updateState,
  UPDATE_DISPLAYED,
  UPDATE_QUERY,
  UPDATE_SIMILARS,
  UPDATE_STATE
} from '../../src/actions/search';
import { languages } from '../../src/utilities/language';
import _ from 'lodash';

const mockStore = configureMockStore([thunk]);

// Mock Client() in elasticsearch module.
jest.mock('elasticsearch', () => ({
  // Mock elasticsearch Client() to prevent http request and resolve promise.
  Client: jest.fn().mockImplementation(() => ({
    search: () => Promise.resolve({
      aggregations: {
        unique_id: {
          value: 1
        }
      },
      hits: {
        hits: [
          {
            _source: {
              id: 2,
              titleStudy: 'Similar Study Title'
            }
          }
        ],
        total: 1
      },
      timed_out: false,
      took: 1
    })
  }))
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
    global['_paq'] = [];
  });

  afterEach(() => {
    // Reset mocked modules.
    jest.resetModules();
  });

  describe('INIT_SEARCHKIT action', () => {
    beforeEach(() => {
      // Action uses setTimeout() so use fake timers for these tests.
      jest.useFakeTimers();
    });

    it('is created when initialising searchkit on the results page', () => {
      // Mock Redux store.
      let store = mockStore({
        routing: {
          locationBeforeTransitions: {
            pathname: '/',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          code: 'en',
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
            index: 'cmmstudy_en',
            min_score: 0.5,
            size: 20
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
            index: 'cmmstudy_en',
            min_score: 0.5,
            size: 20
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        },
        {
          type: UPDATE_DISPLAYED,
          displayed: {
            aggregations: {},
            hits: {
              hasChanged: true,
              hits: [],
              ids: "",
              total: 0
            },
            timed_out: false,
            took: 1
          },
          language: 'en'
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
          locationBeforeTransitions: {
            pathname: '/detail',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          code: 'en',
          list: _.map(languages, (language) => _.pick(language, ['code', 'label', 'index']))
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
                id: 1
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
              bool: {
                must: {
                  match: {
                    id: 'search text'
                  }
                }
              }
            },
            size: 20
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        },
        {
          type: UPDATE_DISPLAYED,
          displayed: {
            aggregations: {},
            hits: {
              hasChanged: true,
              hits: [{
                _source: {
                  id: 1
                }
              }],
              ids: "",
              total: 1,
            },
            timed_out: false,
            took: 1
          },
          language: 'en'
        },
        {
          type: TOGGLE_LOADING,
          loading: false
        }
      ]);
    });

    it('is created when initialising searchkit on the pid page', () => {
      // Mock Redux store.
      const store = mockStore({
        routing: {
          locationBeforeTransitions: {
            pathname: '/pid',
            query: {
              q: ['search text']
            }
          }
        },
        language: {
          code: 'en',
          list: _.map(languages, (language) => _.pick(language, ['code', 'label', 'index']))
        }
      });

      // Dispatch action.
      store.dispatch(initSearchkit());

      // Manually trigger search to execute query processor.
      searchkit.search();

      // Manually execute setTimeout() callback.
      jest.runAllTimers();

      // State should contain actions in sequence for pid page.
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
              nested:{
                path: 'pidStudies',
                query: {
                  bool: {
                    must: {
                      match: {
                        'pidStudies.pid': 'search text',
                      }
                    }
                  }
                }
              }
            },
            size: 20
          }
        },
        {
          type: UPDATE_STATE,
          state: {}
        }
      ]);
    });

    it('logs user metrics when analytics is enabled', () => {
      // Mock Redux store.
      let store = mockStore({
        routing: {
          locationBeforeTransitions: {
            pathname: '/',
            query: {
              q: 'search text'
            }
          }
        },
        language: {
          code: 'en',
          list: _.map(languages, (language) => _.pick(language, ['code', 'label', 'index']))
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
      expect(global['_paq']).toEqual([
        ['setReferrerUrl', '/?q=search%20text'],
        ['setCustomUrl', '/?q=search%20text'],
        ['setDocumentTitle', 'CESSDA Data Catalogue'],
        ['deleteCustomVariables', 'page'],
        ['setGenerationTimeMs', 0],
        ['trackPageView'],
        ['MediaAnalytics::scanForMedia', null],
        ['FormAnalytics::scanForForms', null],
        ['trackContentImpressionsWithinNode', null],
        ['enableLinkTracking']
      ]);
    });
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

  describe('TOGGLE_LONG_DESCRIPTION action', () => {
    it('is created when long study description visibility changes', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action.
      store.dispatch(toggleLongAbstract('Study Title', 1));

      // State should contain study index.
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_LONG_DESCRIPTION,
          index: 1
        }
      ]);
    });

    it('logs user metrics when analytics is enabled', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action.
      store.dispatch(toggleLongAbstract('Study Title', 1));

      // Analytics library should have pushed event.
      expect(global['_paq']).toEqual([
        ['trackEvent', 'Search', 'Read more', 'Study Title']
      ]);
    });
  });

  describe('UPDATE_DISPLAYED action', () => {
    it('is created when the list of displayed studies is updated', () => {
      // Mock Redux store.
      let store = mockStore({
        language: {
          code: 'en'
        }
      });

      // Dispatch action.
      store.dispatch(
        updateDisplayed([
          {
            id: '1'
          }
        ])
      );

      // State should contain displayed studies and language.
      expect(store.getActions()).toEqual([
        {
          type: UPDATE_DISPLAYED,
          displayed: [
            {
              id: '1'
            }
          ],
          language: 'en'
        }
      ]);
    });
  });

  describe('UPDATE_QUERY action', () => {
    it('is created when searchkit query changes', () => {
      // Mock searchkit query.
      const query = {
        query: {
          bool: {
            must: [queryBuilder('search text', {})]
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

  describe('UPDATE_SIMILARS action', () => {
    it('is created when the list of similar studies is updated', () => {
      // Mock Redux store.
      let store = mockStore({
        language: {
          code: 'en',
          list: _.map(languages, (language) => _.pick(language, ['code', 'label', 'index']))
        }
      });

      // Dispatch action and wait for promise.
      return store.dispatch(
          updateSimilars({
            id: "1",
            titleStudy: 'Study Title'
          })
        ).then(() => {
          // State should contain similar studies.
          expect(store.getActions()).toEqual([
            {
              type: UPDATE_SIMILARS,
              similars: [
                {
                  id: 2,
                  titleStudy: 'Similar Study Title'
                }
              ]
            }
          ]);
        });
    });
  });

  describe('RESET_SEARCH action', () => {
    beforeEach(() => {
      // Action uses setTimeout() so use fake timers for these tests.
      jest.useFakeTimers();
    });

    it('is created when the list of similar studies is updated', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action.
      store.dispatch(resetSearch());

      // Run the action
      jest.runAllTimers();

      // Action should be returned.
      expect(store.getActions()).toEqual([
        {
          type: RESET_SEARCH
        }
      ]);
    });
  });
});
