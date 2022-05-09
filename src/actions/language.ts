
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

import counterpart from "counterpart";
import searchkit from "../utilities/searchkit";
import { Thunk } from "../types";
import { languages, Language, languageMap } from "../utilities/language";
import getPaq from "../utilities/getPaq";
import { updateStudy } from "./detail";
import { browserHistory } from "react-router";


//////////// Redux Action Creator : INIT_TRANSLATIONS
export const INIT_TRANSLATIONS = "INIT_TRANSLATIONS";

export type InitTranslationsAction = {
  type: typeof INIT_TRANSLATIONS;
  languages: readonly Language[];
  initialLanguage: string | null | undefined;
};

export function initTranslations(): Thunk {
  return (dispatch, getState) => {

    const state = getState();

    languages.forEach(language => {
      // Register translations from the respective JSON files
      try {
        counterpart.registerTranslations(language.code, require(`../../translations/${language.code}.json`));
      } catch (e) {
        const errorMessage = `Couldn't load translation for language '${language.code}'`;
        if (e instanceof Error) {
          console.debug(`${errorMessage}: ${e.message}`);
        } else {
          console.debug(`${errorMessage}: ${e}`);
        }
      }
    });

    // Check if a language is set in the URL
    let initialLanguage = `${state.routing.locationBeforeTransitions.query.lang}`;

    if (languageMap.has(initialLanguage)) {
      counterpart.setLocale(initialLanguage);
    } else {
      initialLanguage = state.language.currentLanguage.code;
      counterpart.setLocale(state.language.currentLanguage.code);
    }

    // Fallback to English if the locale is not available
    counterpart.setFallbackLocale('en');

    searchkit.translateFunction = (key: string): string | undefined => {
      const numberOfResults = process.env.PASC_DEBUG_MODE === 'true' ? 'numberOfResultsWithTime' : 'numberOfResults';
      switch (key) {
        case 'searchbox.placeholder': 
          return counterpart.translate('search');
        case 'hitstats.results_found': 
          return counterpart.translate(numberOfResults, {
            count: searchkit.getHitsCount(),
            label: getState().language.currentLanguage.label,
            total: getState().search.totalStudies,
            time: searchkit.getTime()
          });
        case 'NoHits.NoResultsFound': 
          return counterpart.translate('noHits.noResultsFound', {
            query: searchkit.getQueryAccessor().state.value
          });
        case 'NoHits.SearchWithoutFilters': 
          return counterpart.translate('noHits.searchWithoutFilters', {
            query: searchkit.getQueryAccessor().state.value
          });
        case 'NoHits.Error': 
          return counterpart.translate('noHits.error');
        case 'NoHits.ResetSearch': 
          return counterpart.translate('noHits.resetSearch');
        default:
          return undefined;
      }
    };

    browserHistory.listen(listner => {
      // If the language has changed
      if (listner.query.lang && listner.query.lang !== state.routing.locationBeforeTransitions.query.lang) {
        dispatch(changeLanguage(`${listner.query.lang}`));
      }
    })

    dispatch({
      type: INIT_TRANSLATIONS,
      languages,
      initialLanguage
    });
  };
}

//////////// Redux Action Creator : CHANGE_LANGUAGE
export const CHANGE_LANGUAGE = "CHANGE_LANGUAGE";

export type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE;
  code: string;
  label: string;
};

export function changeLanguage(code: string): Thunk {
  return (dispatch, getState) => {
    const state = getState();

    code = code.toLowerCase();

    const language = languages.find(element => element.code === code);

    let label: string;

    if (!language) {
      code = "en";
      label = languages.find(element => element.code === code)?.label || '';
    } else {
      // Notify Matomo Analytics of language change.
      const _paq = getPaq();
      _paq.push(['trackEvent', 'Language', 'Change Language', code.toUpperCase()]);

      label = language.label;
    }

    counterpart.setLocale(code);


    dispatch({
      type: CHANGE_LANGUAGE,
      code,
      label
    });
    
    if (state.search.displayed[0]) {
      dispatch(updateStudy(state.search.displayed[0].id));
    }

    if (state.routing.locationBeforeTransitions.pathname === "/") {
      searchkit.reloadSearch();
    }
  };
}

////////////

export type LanguageAction = InitTranslationsAction | ChangeLanguageAction;
