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

import searchkit, { detailQuery, pidQuery } from "../utilities/searchkit";
import _ from "lodash";
import { Thunk } from "../types";
import { CMMStudy, getStudyModel } from "../../common/metadata";
import getPaq from "../utilities/getPaq";
import { SearchRequest, SearchResponse } from "@elastic/elasticsearch/lib/api/types";

//////////// Redux Action Creator : INIT_SEARCHKIT
export const INIT_SEARCHKIT = "INIT_SEARCHKIT";

export type InitSearchkitAction = {
  type: typeof INIT_SEARCHKIT;
};

// Extend the search request object to include the index
type SearchkitSearchRequest = {
  /** Index to search in */
  index: string;
} & SearchRequest;

export function initSearchkit(): Thunk {
  return (dispatch, getState) => {
    let timer: NodeJS.Timeout;

    searchkit.setQueryProcessor((query: SearchkitSearchRequest) => {
      dispatch(toggleLoading(true));

      const state = getState();
      const init = timer === undefined;

      clearTimeout(timer);

      timer = setTimeout((): void => {
        if (!init) {
          // Notify Matomo Analytics of new search query.
          const _paq = getPaq();
          _paq.push(['setReferrerUrl', '/' + searchkit.history.location.search]);
          _paq.push(['setCustomUrl', '/' + searchkit.history.location.search]);
          _paq.push(['setDocumentTitle', 'CESSDA Data Catalogue']);

          // Remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
          _paq.push(['deleteCustomVariables', 'page']);
          _paq.push(['trackPageView']);

          // Make Matomo aware of newly added content
          const content = document.getElementById('root');
          _paq.push(['MediaAnalytics::scanForMedia', content]);
          _paq.push(['FormAnalytics::scanForForms', content]);
          _paq.push(['trackContentImpressionsWithinNode', content]);
          _paq.push(['enableLinkTracking']);
        }
      }, 3000);

      const path = _.trim(state.routing.locationBeforeTransitions.pathname, '/');
      let pathQuery = state.routing.locationBeforeTransitions.query.q;

      if (Array.isArray(pathQuery)) {
        pathQuery = pathQuery.join();
      }

      // Always track total hits.
      query.track_total_hits = true;

      if (path === 'detail' && pathQuery) {
        // If viewing detail page, override query to retrieve single record using its ID.
        query.query = detailQuery(_.trim(pathQuery, '"'));

      } else if (path === 'pid' && pathQuery) {
        // If viewing detail page, override query to retrieve single record using its pid.
        query.query = pidQuery(_.trim(pathQuery, '"'));

      } else {
        // Elasticsearch will match almost anything without this
        query.min_score = 0.5;
      }

      // Add the current language index to the query for Elasticsearch.
      query.index = state.language.currentLanguage.index;

      dispatch(updateQuery(query));
      dispatch(updateState(searchkit.state));

      return query;
    });

    searchkit.addResultsListener((results: SearchResponse<CMMStudy>): void => {
      dispatch(updateDisplayed(results));
      dispatch(toggleLoading(false));
    });

    dispatch({
      type: INIT_SEARCHKIT
    });
  };
}

//////////// Redux Action Creator : TOGGLE_LOADING
export const TOGGLE_LOADING = "TOGGLE_LOADING";

export type ToggleLoadingAction = {
  type: typeof TOGGLE_LOADING;
  loading: boolean;
};

export const toggleLoading = (loading: boolean): ToggleLoadingAction => {
  return {
    type: TOGGLE_LOADING,
    loading
  };
};

//////////// Redux Action Creator : TOGGLE_MOBILE_FILTERS
export const TOGGLE_MOBILE_FILTERS = "TOGGLE_MOBILE_FILTERS";

export type ToggleMobileFiltersAction = {
  type: typeof TOGGLE_MOBILE_FILTERS;
};

export const toggleMobileFilters = (): ToggleMobileFiltersAction => {
  return {
    type: TOGGLE_MOBILE_FILTERS
  };
};

//////////// Redux Action Creator : TOGGLE_ADVANCED_SEARCH
export const TOGGLE_ADVANCED_SEARCH = "TOGGLE_ADVANCED_SEARCH";

export type ToggleAdvancedSearchAction = {
  type: typeof TOGGLE_ADVANCED_SEARCH;
};

export const toggleAdvancedSearch = (): ToggleAdvancedSearchAction => {
  return {
    type: TOGGLE_ADVANCED_SEARCH
  };
};

//////////// Redux Action Creator : TOGGLE_SUMMARY
export const TOGGLE_SUMMARY = "TOGGLE_SUMMARY";

export type ToggleSummaryAction = {
  type: typeof TOGGLE_SUMMARY;
};

export const toggleSummary = (): ToggleSummaryAction => {
  return {
    type: TOGGLE_SUMMARY
  };
};

//////////// Redux Action Creator : TOGGLE_METADATA_PANELS
export const TOGGLE_METADATA_PANELS = "TOGGLE_METADATA_PANELS";

export type ToggleMetadataPanelsAction = {
  type: typeof TOGGLE_METADATA_PANELS;
};

export const toggleMetadataPanels = (): ToggleMetadataPanelsAction => {
  return {
    type: TOGGLE_METADATA_PANELS
  };
};

//////////// Redux Action Creator : UPDATE_DISPLAYED
export const UPDATE_DISPLAYED = "UPDATE_DISPLAYED";

export type UpdateDisplayedAction = {
  type: typeof UPDATE_DISPLAYED;
  displayed: CMMStudy[];
};

export function updateDisplayed(displayed: SearchResponse<Partial<CMMStudy>>): UpdateDisplayedAction {
  return {
    type: UPDATE_DISPLAYED,
    displayed: displayed.hits.hits.map(hit => getStudyModel(hit._source, hit.highlight))
  };
}

//////////// Redux Action Creator : UPDATE_QUERY
export const UPDATE_QUERY = "UPDATE_QUERY";

export type UpdateQueryAction = {
  type: typeof UPDATE_QUERY;
  query: SearchkitSearchRequest;
};

export function updateQuery(query: SearchkitSearchRequest): UpdateQueryAction {
  return {
    type: UPDATE_QUERY,
    query
  };
}

//////////// Redux Action Creator : UPDATE_STATE
export const UPDATE_STATE = "UPDATE_STATE";

export type SearchkitState = any;

export type UpdateStateAction = {
  type: typeof UPDATE_STATE;
  state: SearchkitState;
};

export function updateState(state: SearchkitState): UpdateStateAction {
  return {
    type: UPDATE_STATE,
    state
  };
}

//////////// Redux Action Creator : RESET_SEARCH
export const RESET_SEARCH = "RESET_SEARCH";

export type ResetSearchAction = {
  type: typeof RESET_SEARCH;
};

export function resetSearch(): ResetSearchAction {
  // Use timeout to ensure searchkit is reset after pending router events.
  setTimeout(() => {
    searchkit.resetState();
    searchkit.reloadSearch();
  });

  return {
    type: RESET_SEARCH
  };
}

//////////// Redux Action Creator : UPDATE_TOTAL_STUDIES
export const UPDATE_TOTAL_STUDIES = "UPDATE_TOTAL_STUDIES";

export type UpdateTotalStudiesAction = {
  type: typeof UPDATE_TOTAL_STUDIES;
  totalStudies: number;
};

export function updateTotalStudies(): Thunk<Promise<void>> {
  return async (dispatch) => {
    try {
      const response = await fetch(`${window.location.origin}/api/sk/_total_studies`);

      if (response.ok) {
        const source = await response.json();
        dispatch({
          type: UPDATE_TOTAL_STUDIES,
          totalStudies: source.totalStudies
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
}
////////////

export type SearchAction =
  | InitSearchkitAction
  | ToggleLoadingAction
  | ToggleMobileFiltersAction
  | ToggleAdvancedSearchAction
  | ToggleSummaryAction
  | ToggleMetadataPanelsAction
  | UpdateDisplayedAction
  | UpdateQueryAction
  | UpdateStateAction
  | ResetSearchAction
  | UpdateTotalStudiesAction;
