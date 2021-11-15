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

import searchkit, { detailQuery, similarQuery, pidQuery, matchAllQuery, uniqueAggregation } from "../utilities/searchkit";
import { Client, SearchResponse } from "elasticsearch";
import _ from "lodash";
import { Thunk } from "../types";
import { CMMStudy } from "../../common/metadata";
import getPaq from "../utilities/getPaq";

// Get a new Elasticsearch Client
function elasticsearchClient() {
  const protocol = _.trim(window.location.protocol, ':');
  return new Client({
    host: {
      protocol: protocol,
      host: window.location.hostname,
      port: window.location.port || (protocol.endsWith('s') ? 443 : 80),
      path: '/api/sk'
    },
    // Avoid timing out searches on slow connections.
    requestTimeout: 2147483647 // Largest supported timeout.
  });
}

//////////// Redux Action Creator : INIT_SEARCHKIT
export const INIT_SEARCHKIT = "INIT_SEARCHKIT";

export type InitSearchkitAction = {
  type: typeof INIT_SEARCHKIT;
};

export function initSearchkit(): Thunk {
  return (dispatch, getState) => {
    let timer: NodeJS.Timeout;

    searchkit.setQueryProcessor((query: any) => {
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
          //    _paq.push(['setGenerationTimeMs', 0]);
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
      const state = getState();

      // Load similar results if viewing detail page and data exists.
      if ((_.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'detail' || _.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'study/pid') &&
        results.hits.hits.length > 0 &&
        results.hits.hits[0]._source) {
        dispatch(updateSimilars(results.hits.hits[0]._source));
      }

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

//////////// Redux Action Creator : TOGGLE_LONG_DESCRIPTION
export const TOGGLE_LONG_DESCRIPTION = "TOGGLE_LONG_DESCRIPTION";

export type ToggleLongAbstractAction = {
  type: typeof TOGGLE_LONG_DESCRIPTION;
  index: number;
};

export const toggleLongAbstract = (title: string, index: number): Thunk => {
  return (dispatch) => {
    // Notify Matomo Analytics of toggling "Read more" for a study.
    const _paq = getPaq();
    _paq.push(['trackEvent', 'Search', 'Read more', title]);

    dispatch({
      type: TOGGLE_LONG_DESCRIPTION,
      index
    });
  };
};

//////////// Redux Action Creator : UPDATE_DISPLAYED
export const UPDATE_DISPLAYED = "UPDATE_DISPLAYED";

export type UpdateDisplayedAction = {
  type: typeof UPDATE_DISPLAYED;
  displayed: Pick<SearchResponse<CMMStudy>, "hits">;
};

export function updateDisplayed(displayed: SearchResponse<CMMStudy>): UpdateDisplayedAction {
  return {
    type: UPDATE_DISPLAYED,
    displayed
  };
}

//////////// Redux Action Creator : UPDATE_QUERY
export const UPDATE_QUERY = "UPDATE_QUERY";

export type UpdateQueryAction = {
  type: typeof UPDATE_QUERY;
  query: Record<string, any>;
};

export function updateQuery(query: Record<string, any>): UpdateQueryAction {
  return {
    type: UPDATE_QUERY,
    query
  };
}

//////////// Redux Action Creator : UPDATE_STATE
export const UPDATE_STATE = "UPDATE_STATE";

export type SearchkitState = {
  q: string;
};

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

//////////// Redux Action Creator : UPDATE_SIMILARS
export const UPDATE_SIMILARS = "UPDATE_SIMILARS";

export type UpdateSimilarsAction = {
  type: typeof UPDATE_SIMILARS;
  similars: CMMStudy[];
};

export function updateSimilars(item: CMMStudy): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();

    const response = await elasticsearchClient().search<CMMStudy>({
      size: 5,
      body: {
        index: state.language.currentLanguage.index,
        query: similarQuery(item.id, item.titleStudy)
      }
    });

    dispatch({
      type: UPDATE_SIMILARS,
      similars: response.hits.hits.map(hit => hit._source)
    });
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
      const response = await elasticsearchClient().search({
        size: 0,
        body: {
          index: "cmmstudy_*",
          query: matchAllQuery(),
          aggs: uniqueAggregation()
        }
      });

      dispatch({
        type: UPDATE_TOTAL_STUDIES,
        totalStudies: response.aggregations.unique_id.value
      });
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
  | ToggleLongAbstractAction
  | UpdateDisplayedAction
  | UpdateQueryAction
  | UpdateStateAction
  | UpdateSimilarsAction
  | ResetSearchAction
  | UpdateTotalStudiesAction;
