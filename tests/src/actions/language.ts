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
import thunk, { ThunkDispatch } from 'redux-thunk';
import counterpart from 'counterpart';
import searchkit from '../../../src/utilities/searchkit';
import { changeLanguage, initTranslations } from '../../../src/actions/language';
import { Language, languages } from '../../../src/utilities/language';
import _ from 'lodash';
import { State } from '../../../src/types';
import { AnyAction } from 'redux';
import { hashHistory } from 'react-router';
import { mockStudy } from '../../common/mockdata';

const mockStore = configureMockStore<State, ThunkDispatch<State, any, AnyAction>>([thunk]);

jest.mock('../../src/actions/search', () => ({
  updateStudy: jest.fn().mockImplementation(() => () => Promise.resolve())
}));

const enLanguage: Language = {
  code: 'en',
  label: 'English',
  index: 'cmmstudy_en'
}

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
    // @ts-expect-error
    global['_paq'] = [];

    // Register a translation required for tests.
    counterpart.registerTranslations(enLanguage.code, enLanguage);
  });

  describe('INIT_TRANSLATIONS action', () => {
    it('is created when initialising language support', () => {
      // Add an non-existant language to the languages list
      // The languages array is made writable to add the fake language
      (languages as Array<Language>).push({
        code: "moon",
        label: "Mocked Lanuguage",
        index: "cmmstudy_moon"
      });

      // Mock Redux store.
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        },
        // @ts-expect-error
        search: {
          totalStudies: 0
        },
        routing: {
          locationBeforeTransitions: hashHistory.createLocation("/")
        }
      });



      // Dispatch action.
      store.dispatch(initTranslations());

      // At least 1 translation should be registered
      // @ts-expect-error - Workaround types not including conterpart.getAvailableLocales()
      expect(counterpart.getAvailableLocales().length).toBeGreaterThan(0);

      // Translations should not include debug information.
      expect(searchkit.translateFunction('hitstats.results_found')).toBe(
        counterpart.translate('numberOfResults', {
          count: 0,
          time: 0,
          total: 0,
          label: enLanguage.label,
        })
      );

      // State should list all available languages.
      expect(store.getActions()).toEqual([
        {
          type: 'INIT_TRANSLATIONS',
          initialLanguage: "en",
          languages: languages.map(language => _.pick(language, ['code', 'label', 'index']))
        }
      ]);
    });

    it('includes debug output when debug mode is enabled', () => {
      // Mock Redux store.
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        },
        // @ts-expect-error
        search: {
          totalStudies: 0
        },
        routing: {
          locationBeforeTransitions: hashHistory.createLocation("/")
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
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        },
        //@ts-expect-error
        detail: {
          study: mockStudy
        },
        routing: {
          locationBeforeTransitions: hashHistory.createLocation("/")
        }
      });

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
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        },
        //@ts-expect-error
        detail: {
          study: mockStudy
        },
        routing: {
          locationBeforeTransitions: hashHistory.createLocation("/")
        }
      });

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
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        },
        //@ts-expect-error
        detail: {
          study: mockStudy
        },
        routing: {
          locationBeforeTransitions: hashHistory.createLocation("/")
        }
      });

      // Dispatch action with registered locale.
      store.dispatch(changeLanguage(languages[0].code));

      // Analytics library should have pushed event.
      // @ts-expect-error
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
