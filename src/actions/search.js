// @flow
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



import searchkit, { detailQuery, similarQuery, pidQuery, matchAllQuery, uniqueAggregation } from '../utilities/searchkit';
import { Client } from 'elasticsearch';
import _ from 'lodash';
import type { Dispatch, GetState, State, Thunk } from '../types';

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

export type InitSearchkitAction = {
  type: 'INIT_SEARCHKIT'
};

export const initSearchkit = (): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    let timer: TimeoutID;

    searchkit.setQueryProcessor((query: Object): Object => {
      dispatch(toggleLoading(true));

      let state: State = getState(),
        init: boolean = timer === undefined;

      clearTimeout(timer);

      timer = setTimeout((): void => {
        if (!init) {
          // Notify Matomo Analytics of new search query.
          let _paq = window._paq || [];
          _paq.push(['setReferrerUrl', '/' + searchkit.history.location.search]);
          _paq.push(['setCustomUrl', '/' + searchkit.history.location.search]);
          _paq.push(['setDocumentTitle', 'CESSDA Data Catalogue']);

          // Remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
          _paq.push(['deleteCustomVariables', 'page']);
          _paq.push(['setGenerationTimeMs', 0]);
          _paq.push(['trackPageView']);

          // Make Matomo aware of newly added content
          let content = document.getElementById('root');
          _paq.push(['MediaAnalytics::scanForMedia', content]);
          _paq.push(['FormAnalytics::scanForForms', content]);
          _paq.push(['trackContentImpressionsWithinNode', content]);
          _paq.push(['enableLinkTracking']);
        }
      }, 3000);

      const path = _.trim(state.routing.locationBeforeTransitions.pathname, '/');
      const pathQuery = state.routing.locationBeforeTransitions.query.q;

      if (path === 'detail' && pathQuery !== undefined) {
        // If viewing detail page, override query to retrieve single record using its ID.
        query.query = detailQuery(_.trim(pathQuery, '"'));     

      } else if (path === 'pid' && pathQuery !== undefined) {
        // If viewing detail page, override query to retrieve single record using its pid.
        query.query = pidQuery(_.trim(pathQuery, '"'));

      } else {
        // Elasticsearch will match almost anything without this
        query.min_score = 0.5; 
      }

      // Add the current language index to the query for Elasticsearch.
      query.index = _.find(state.language.list, { 'code': state.language.code }).index;

      dispatch(updateQuery(query));
      dispatch(updateState(searchkit.state));

      dispatch(updateTotalStudies());

      return query;
    });

    searchkit.addResultsListener((results: Object): void => {
      let state: State = getState();

      // Load similar results if viewing detail page and data exists.
      if ((_.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'detail' || _.trim(state.routing.locationBeforeTransitions.pathname, '/') === 'study/pid') &&
          results.hits.hits.length > 0 &&
          results.hits.hits[0]._source) {
        dispatch(updateSimilars(results.hits.hits[0]._source));
      }

      dispatch(updateDisplayed(results.hits.hits));
      dispatch(toggleLoading(false));
    });

    dispatch({
      type: 'INIT_SEARCHKIT'
    });
  };
};

//////////// Redux Action Creator : TOGGLE_LOADING

export type ToggleLoadingAction = {
  type: 'TOGGLE_LOADING',
  loading: boolean
};

export const toggleLoading = (loading: boolean): ToggleLoadingAction => {
  return {
    type: 'TOGGLE_LOADING',
    loading
  };
};

//////////// Redux Action Creator : TOGGLE_MOBILE_FILTERS

export type ToggleMobileFiltersAction = {
  type: 'TOGGLE_MOBILE_FILTERS'
};

export const toggleMobileFilters = (): ToggleMobileFiltersAction => {
  return {
    type: 'TOGGLE_MOBILE_FILTERS'
  };
};

//////////// Redux Action Creator : TOGGLE_ADVANCED_SEARCH

export type ToggleAdvancedSearchAction = {
  type: 'TOGGLE_ADVANCED_SEARCH'
};

export const toggleAdvancedSearch = (): ToggleAdvancedSearchAction => {
  return {
    type: 'TOGGLE_ADVANCED_SEARCH'
  };
};

//////////// Redux Action Creator : TOGGLE_SUMMARY

export type ToggleSummaryAction = {
  type: 'TOGGLE_SUMMARY'
};

export const toggleSummary = (): ToggleSummaryAction => {
  return {
    type: 'TOGGLE_SUMMARY'
  };
};

//////////// Redux Action Creator : TOGGLE_METADATA_PANELS

export type ToggleMetadataPanelsAction = {
  type: 'TOGGLE_METADATA_PANELS'
};

export const toggleMetadataPanels = (): ToggleMetadataPanelsAction => {
  return {
    type: 'TOGGLE_METADATA_PANELS'
  };
};

//////////// Redux Action Creator : TOGGLE_LONG_DESCRIPTION

export type ToggleLongAbstractAction = {
  type: 'TOGGLE_LONG_DESCRIPTION',
  index: number
};

export const toggleLongAbstract = (title: string, index: number): Thunk => {
  return (dispatch: Dispatch): void => {
    // Notify Matomo Analytics of toggling "Read more" for a study.
    let _paq = window._paq || [];
    _paq.push(['trackEvent', 'Search', 'Read more', title]);
    
    dispatch({
      type: 'TOGGLE_LONG_DESCRIPTION',
      index
    });
  };
};

//////////// Redux Action Creator : UPDATE_DISPLAYED

export type UpdateDisplayedAction = {
  type: 'UPDATE_DISPLAYED',
  displayed: any,
  language: string
};

export const updateDisplayed = (displayed: Object[]): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    dispatch({
      type: 'UPDATE_DISPLAYED',
      displayed,
      language: getState().language.code
    });
  };
};

//////////// Redux Action Creator : UPDATE_QUERY

export type UpdateQueryAction = {
  type: 'UPDATE_QUERY',
  query: Object
};

export const updateQuery = (query: Object): UpdateQueryAction => {
  return {
    type: 'UPDATE_QUERY',
    query
  };
};

//////////// Redux Action Creator : UPDATE_STATE

export type UpdateStateAction = {
  type: 'UPDATE_STATE',
  state: Object
};

export const updateState = (state: Object): UpdateStateAction => {
  return {
    type: 'UPDATE_STATE',
    state
  };
};

//////////// Redux Action Creator : UPDATE_SIMILARS

export type UpdateSimilarsAction = {
  type: 'UPDATE_SIMILARS',
  similars: any
};

export const updateSimilars = (item: Object): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    let state: State = getState(),
      index: string = _.find(state.language.list, { 'code': state.language.code }).index;

    return elasticsearchClient().search({
      size: 10,
      body: {
        index: index,
        query: similarQuery(item.titleStudy)
      }
    }).then((response: Object): void => {
      dispatch({
        type: 'UPDATE_SIMILARS',
        similars: _.uniqBy(
          _.filter( 
            response.hits.hits, 
            (hit: Object): boolean => hit._source && hit._source.id !== item.id && hit._source.titleStudy !== item.titleStudy
          ),
          (hit: Object): string => hit._source.titleStudy
        )
      });
    });
  };
};

//////////// Redux Action Creator : RESET_SEARCH

export type ResetSearchAction = {
  type: 'RESET_SEARCH'
};

export const resetSearch = (): Thunk => {
  return (dispatch: Dispatch): void => {
    // Use timeout to ensure searchkit is reset after pending router events.
    setTimeout(() => {
      searchkit.resetState();
      searchkit.reloadSearch();
    });
    dispatch({
      type: 'RESET_SEARCH'
    });
  };
};

//////////// Redux Action Creator : UPDATE_TOTAL_STUDIES

export type UpdateTotalStudiesAction = {
  type: 'UPDATE_TOTAL_STUDIES',
  totalStudies: Number
};

export const updateTotalStudies = (item: Object): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {

    const index = "cmmstudy_*";

    return elasticsearchClient().search({
      size: 0,
      body: {
        index: index,
        query: matchAllQuery(),
        aggs: uniqueAggregation()
      }
    }).then((response: Object): void => {
      dispatch({
        type: 'UPDATE_TOTAL_STUDIES',
        totalStudies: response.aggregations.unique_id.value
      });
    });
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
