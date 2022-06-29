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

import { CHANGE_LANGUAGE, INIT_TRANSLATIONS } from "../../../src/actions/language";
import language from '../../../src/reducers/language';
import { languages } from '../../../src/utilities/language';
import _ from 'lodash';
import { RESET_SEARCH } from "../../../src/actions/search";

describe('Language reducer', () => {

  it('should return the initial state', () => {
    //@ts-ignore
    expect(language(undefined, {})).toEqual({
      currentLanguage: {
        code: 'en',
        label: 'English',
        index: 'cmmstudy_en'
      },
      list: []
    });
  });

  it('should handle INIT_TRANSLATIONS', () => {
    const list = languages.map(language => _.pick(language, ['code', 'label', 'index']));
    expect(
      language(
        undefined,
        {
          type: INIT_TRANSLATIONS,
          languages: list,
          initialLanguage: "en"
        }
      )
    ).toEqual({
      currentLanguage: {
        code: "en",
        index: "cmmstudy_en",
        label: "English",
      },
      list: list
    });
  });

  it('should handle CHANGE_LANGUAGE', () => {
    expect(
      language(
        //@ts-ignore
        {},
        {
          type: CHANGE_LANGUAGE,
          code: languages[0].code
        }
      )
    ).toEqual({
      currentLanguage: languages[0]
    });
  });

  it('should handle unknown action type', () => {
    const state = {
      currentLanguage: languages[0],
      list: languages
    };
    expect(language(state, {type: RESET_SEARCH})).toEqual(state);
  });
});
