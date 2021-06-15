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
import counterpart from 'counterpart';
import searchkit from '../../src/utilities/searchkit';
import { changeLanguage, initTranslations } from '../../src/actions/language';
import { languages } from '../../src/utilities/language';
import _ from 'lodash';

const mockStore = configureMockStore([thunk]);

describe('Language actions', () => {

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

    // Register a translation required for tests.
    counterpart.registerTranslations(languages[0].code, languages[0].locale);
  });

  describe('INIT_TRANSLATIONS action', () => {
    it('is created when initialising language support', () => {
      // Mock Redux store.
      let store = mockStore({
        language: {
          code: languages[0].code,
          label: languages[0].label,
        },
        search: {
          totalStudies: 0
        }
      });

      // Dispatch action.
      store.dispatch(initTranslations());

      // At least 1 translation should be registered
      expect(counterpart.getAvailableLocales().length).toBeGreaterThan(0);

      // Translations should not include debug information.
      expect(searchkit.translateFunction('hitstats.results_found')).toBe(
        counterpart.translate('numberOfResults', {
          count: 0,
          time: 0,
          total: 0,
          label: 'Danish',
        })
      );

      // State should list all available languages.
      expect(store.getActions()).toEqual([
        {
          type: 'INIT_TRANSLATIONS',
          languages: _.map(languages, function(language) {
            return _.pick(language, ['code', 'label', 'index']);
          })
        }
      ]);
    });

    it('includes debug output when debug mode is enabled', () => {
      // Mock Redux store.
      let store = mockStore({
        language: {
          code: languages[0].code,
          label: languages[0].label,
        },
        search: {
          totalStudies: 0
        }
      });

      // Enable debug mode for test.
      process.env.PASC_DEBUG_MODE = 'true';

      // Dispatch action.
      store.dispatch(initTranslations());

      // Translations should include debug information.
      expect(searchkit.translateFunction('hitstats.results_found')).toBe(
        counterpart.translate('numberOfResultsWithTime', {
          count: 0,
          time: 0
        })
      );
    });
  });

  describe('CHANGE_LANGUAGE action', () => {
    it('is created when selecting a language with a registered locale', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action with registered locale.
      store.dispatch(changeLanguage(languages[0].code));

      // Locale registered so should use selected language.
      expect(store.getActions()).toEqual([
        {
          type: 'CHANGE_LANGUAGE',
          label: languages[0].label,
          code: languages[0].code
        }
      ]);
    });

    it('is created when selecting a language without a registered locale', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action with unregistered locale.
      store.dispatch(changeLanguage('xyz'));

      // Locale not registered so should default to English (en).
      expect(store.getActions()).toEqual([
        {
          type: 'CHANGE_LANGUAGE',
          label: 'English',
          code: 'en'
        }
      ]);
    });

    it('logs user metrics when analytics is enabled', () => {
      // Mock Redux store.
      let store = mockStore({});

      // Dispatch action with registered locale.
      store.dispatch(changeLanguage(languages[0].code));

      // Analytics library should have pushed event.
      expect(global['_paq']).toEqual([
        [
          'trackEvent',
          'Language',
          'Change Language',
          languages[0].code.toUpperCase()
        ]
      ]);
    });
  });
});
