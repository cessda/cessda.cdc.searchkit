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

import { Language, languages } from '../../../src/utilities/language';

describe('Language utilities', () => {
  describe('getLanguages()', () => {
    it('should return a list of languages', () => {
      expect(languages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(String),
            label: expect.any(String),
            index: expect.any(String)
          })
        ])
      );
    });
  });
});

export const enLanguage: Language = {
  code: 'en',
  label: 'English',
  index: 'cmmstudy_en'
}
