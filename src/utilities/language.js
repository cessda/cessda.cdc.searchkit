// @flow

import en from '../locales/de';
import de from '../locales/en';
import fi from '../locales/fi';
import fi from '../locales/fr';
//import fi from '../locales/nl';
import se from '../locales/se';
import sk from '../locales/sk';
//import fi from '../locales/sl';

export function getLanguages(): Object[] {
  // Register translations stored in the "/locales" directory by adding them to the array below.
  // To add a new language with an associated Elasticsearch index, use the following format:
  // {
  //   code   : The 2 letter ISO code for this language.
  //   label  : The native label for this language.
  //   index  : The Elasticsearch index containing data for this language.
  //   locale : The imported locale for this language.
  // }
  return [{
    code: 'de',
    label: 'Deutsch',
    index: 'cmmstudy_de',
    locale: de
  }, {
    code: 'en',
    label: 'English',
    index: 'cmmstudy_en',
    locale: en
  }, {
    code: 'fi',
    label: 'Suomi',
    index: 'cmmstudy_fi',
    locale: fi
  }, {
    code: 'fr',
    label: 'Francais',
    index: 'cmmstudy_fr', 
    locale: fr
  }, {
    code: 'nl',
    label: 'Dutch',
    index: 'cmmstudy_nl',
    locale: nl
  }, {
    code: 'se',
    label: 'Svenska',
    index: 'cmmstudy_en', // TODO : Change to 'cmmstudy_se' when Elasticsearch index is ready.
    locale: se
  }, {
    code: 'sk',
    label: 'Slovenský',
    index: 'cmmstudy_en', // TODO : Change to 'cmmstudy_sk' when Elasticsearch index is ready.
    locale: sk
  }, {
    code: 'sl',
    label: 'Francais',
    index: 'cmmstudy_en', // TODO : Change to 'cmmstudy_sl' when Elasticsearch index is ready.
    locale: sl
  }];
}
