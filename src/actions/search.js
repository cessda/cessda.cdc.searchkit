// @flow

import searchkit, {similarQuery} from '../utilities/searchkit';
import * as elasticsearch from 'elasticsearch';
import * as Globals from '../../config';
import * as _ from 'lodash';
import type {Dispatch, GetState, Thunk} from '../types';
import * as ReactGA from 'react-ga';

//////////// Redux Action Creator : INIT_SEARCHKIT

export type InitSearchkitAction = {
  type: 'INIT_SEARCHKIT'
}

export const initSearchkit = (): Thunk => {
  return (dispatch: Dispatch): void => {
    let timer: number;

    searchkit.setQueryProcessor((query: Object): Object => {
      let init: boolean = timer === undefined;

      clearTimeout(timer);

      timer = setTimeout((): void => {
        if (!init) {
          ReactGA.pageview('/' + searchkit.history.location.search);
        }
      }, 3000);

      dispatch(updateQuery(query));
      dispatch(updateState(searchkit.state));

      return query;
    });

    searchkit.addResultsListener((results: Object): void => {
      dispatch(updateDisplayed(results.hits.hits));
    });

    dispatch({
      type: 'INIT_SEARCHKIT'
    });
  };
};

//////////// Redux Action Creator : TOGGLE_SUMMARY

export type ToggleSummaryAction = {
  type: 'TOGGLE_SUMMARY'
}

export const toggleSummary = (): ToggleSummaryAction => {
  return {
    type: 'TOGGLE_SUMMARY'
  };
};

//////////// Redux Action Creator : TOGGLE_LONG_DESCRIPTION

export type ToggleLongDescriptionAction = {
  type: 'TOGGLE_LONG_DESCRIPTION',
  index: number
}

export const toggleLongDescription = (title: string, index: number): Thunk => {
  return (dispatch: Dispatch): void => {
    ReactGA.event({
      category: 'Search',
      action: 'Read more',
      label: title
    });

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
}

export const updateDisplayed = (displayed: Object[]): Thunk => {
  return (dispatch: Dispatch, getState: GetState): void => {
    dispatch({
      type: 'UPDATE_DISPLAYED',
      displayed,
      language: 'all'
      // TODO : Enable different metadata languages when data mapping is improved.
      // language: getState().language.code
    });
  };
};

//////////// Redux Action Creator : UPDATE_QUERY

export type UpdateQueryAction = {
  type: 'UPDATE_QUERY',
  query: Object
}

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
}

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
}

export const updateSimilars = (item: Object): Thunk => {
  return (dispatch: Dispatch): void => {
    let client: Object = new elasticsearch.Client({
      host: Globals.esURL
    });

    client.search(similarQuery(item.title)).then((response: Object): void => {
      dispatch({
        type: 'UPDATE_SIMILARS',
        similars: _.uniqBy(_.filter(response.hits.hits, (hit: Object): boolean => {
          return hit._id !== item.id && hit.fields['dc.title.all'][0] !== item.title;
        }), (hit: Object): string => {
          return hit.fields['dc.title.all'][0];
        })
      });
    });
  };
};

//////////// Redux Action Creator : RESET_SEARCH

export type ResetSearchAction = {
  type: 'RESET_SEARCH';
}

export const resetSearch = (): Thunk => {
  return (dispatch: Dispatch): void => {
    searchkit.resetState();
    searchkit.reloadSearch();

    dispatch({
      type: 'RESET_SEARCH'
    });
  };
};

////////////

export type SearchAction =
  | InitSearchkitAction
  | ToggleSummaryAction
  | ToggleLongDescriptionAction
  | UpdateDisplayedAction
  | UpdateQueryAction
  | UpdateStateAction
  | UpdateSimilarsAction
  | ResetSearchAction;
