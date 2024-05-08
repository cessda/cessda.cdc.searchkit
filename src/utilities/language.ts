
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


  // Register translations stored in the "/translations" directory by adding them to the array below.
  // To add a new language with an associated Elasticsearch index, use the following format:
  // {
  //   code   : The 2 letter ISO code for this language.
  //   label  : The English label for this language.
  //   index  : The Elasticsearch index containing data for this language.
  // }
export const languages: readonly Language[] =
  [{
    code: 'cs',
    label: 'Czech',
    index: 'cmmstudy_cs'
  },{
    code: 'da',
    label: 'Danish',
    index: 'cmmstudy_da'
  },{
    code: 'nl',
    label: 'Dutch',
    index: 'cmmstudy_nl'
  }, {
    code: 'en',
    label: 'English',
    index: 'cmmstudy_en'
  }, {
    code: 'fi',
    label: 'Finnish',
    index: 'cmmstudy_fi'
  }, {
    code: 'fr',
    label: 'French',
    index: 'cmmstudy_fr'
  }, {
    code: 'de',
    label: 'German',
    index: 'cmmstudy_de'
  }, {
    code: 'el',
    label: 'Greek',
    index: 'cmmstudy_el'
  }, {
    code: 'sk',
    label: 'Slovakian',
    index: 'cmmstudy_sk'
  }, {
    code: 'sl',
    label: 'Slovenian',
    index: 'cmmstudy_sl'
  }, {
    code: 'sv',
    label: 'Swedish',
    index: 'cmmstudy_sv'
  }];

export const languageMap: ReadonlyMap<string, Language> = new Map(languages.map(l => [l.code, l]));

export type Language = {
  /** The ISO code of the language */
  code: string,
  /** The English name of the language */
  label: string,
  /** The index where the language's studies are stored */
  index: string,
};
