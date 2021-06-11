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
import { Dispatch, GetState, State, Thunk } from "../types";
import { CMMStudy } from "../utilities/metadata";
import { getPaq } from "..";

// Get a new Elasticsearch Client
function elasticsearchClient() {
  return new Client({
    host: {
      protocol: _.trim(window.location.protocol, ':'),
      host: window.location.hostname,
      port: window.location.port ||
        (_.endsWith(_.trim(window.location.protocol, ':'), 's') ? 443 : 80),
      path: '/api/sk'
    }
  });
}

//////////// Redux Action Creator : INIT_SEARCHKIT
export const INIT_SEARCHKIT = "INIT_SEARCHKIT";

export type InitSearchkitAction = {
  type: typeof INIT_SEARCHKIT;
};

export const initSearchkit = (): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    let timer: NodeJS.Timeout;

    searchkit.setQueryProcessor((query: any) => {
      dispatch(toggleLoading(true));

      const state: State = getState()
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
          _paq.push(['setGenerationTimeMs', 0]);
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

      if (_.isArray(pathQuery)) {
        pathQuery = pathQuery[0];
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
      query.index = _.find(state.language.list, { code: state.language.code })?.index;

      dispatch(updateQuery(query));
      dispatch(updateState(searchkit.state));

      return query;
    });

    searchkit.addResultsListener((results: SearchResponse<CMMStudy>): void => {
      let state: State = getState();

      // Load similar results if viewing detail page and data exists.
      if ((_.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'detail' || _.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'pid') &&
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
};

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
  return (dispatch: Dispatch): void => {
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
  displayed: SearchResponse<CMMStudy>;
  language: string;
};

export const updateDisplayed = (displayed: SearchResponse<CMMStudy>): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    dispatch({
      type: UPDATE_DISPLAYED,
      displayed,
      language: getState().language.code
    });
  };
};

//////////// Redux Action Creator : UPDATE_QUERY
export const UPDATE_QUERY = "UPDATE_QUERY";

export type UpdateQueryAction = {
  type: typeof UPDATE_QUERY;
  query: Record<string, any>;
};

export const updateQuery = (query: Record<string, any>): UpdateQueryAction => {
  return {
    type: UPDATE_QUERY,
    query
  };
};

//////////// Redux Action Creator : UPDATE_STATE
export const UPDATE_STATE = "UPDATE_STATE";

export type SearchkitState = {
  q: string;
};

export type UpdateStateAction = {
  type: typeof UPDATE_STATE;
  state: SearchkitState;
};

export const updateState = (state: any): UpdateStateAction => {
  return {
    type: UPDATE_STATE,
    state
  };
};

//////////// Redux Action Creator : UPDATE_SIMILARS
export const UPDATE_SIMILARS = "UPDATE_SIMILARS";

export type UpdateSimilarsAction = {
  type: typeof UPDATE_SIMILARS;
  similars: CMMStudy[];
};

export const updateSimilars = (item: CMMStudy): Thunk => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state: State = getState();
    const index = _.find(state.language.list, { 'code': state.language.code })?.index;

    const response = await elasticsearchClient().search<CMMStudy>({
      size: 10,
      body: {
        index: index,
        query: similarQuery(item.titleStudy)
      }
    });

    dispatch({
      type: UPDATE_SIMILARS,
      similars: _.uniqBy(
        _.filter(response.hits.hits, (hit => hit._source && hit._source.id !== item.id && hit._source.titleStudy !== item.titleStudy)),
        (hit => hit._source.titleStudy)
      ).map(hit => hit._source)
    });
  };
};

//////////// Redux Action Creator : RESET_SEARCH
export const RESET_SEARCH = "RESET_SEARCH";

export type ResetSearchAction = {
  type: typeof RESET_SEARCH;
};

export const resetSearch = (): Thunk => {
  return (dispatch: Dispatch): void => {
    // Use timeout to ensure searchkit is reset after pending router events.
    setTimeout(() => {
      searchkit.resetState();
      searchkit.reloadSearch();
    });
    dispatch({
      type: RESET_SEARCH
    });
  };
};

//////////// Redux Action Creator : UPDATE_TOTAL_STUDIES
export const UPDATE_TOTAL_STUDIES = "UPDATE_TOTAL_STUDIES";

export type UpdateTotalStudiesAction = {
  type: typeof UPDATE_TOTAL_STUDIES;
  totalStudies: number;
};

export const updateTotalStudies = (): Thunk => {
  return async (dispatch: Dispatch) => {
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
};

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
