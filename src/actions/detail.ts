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

import _ from "lodash";
import { CMMStudy, getStudyModel, Similar } from "../../common/metadata";
import { Thunk } from "../types";

//////////// Redux Action Creator : UPDATE_STUDY
export const UPDATE_STUDY = "UPDATE_STUDY";

export type UpdateStudyAction = {
  type: typeof UPDATE_STUDY;
  displayed: CMMStudy | undefined;
};

export function updateStudy(id: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();

    const response = await fetch(`${window.location.origin}/api/sk/_get/${state.language.currentLanguage.index}/${encodeURIComponent(id)}`);

    if (response.status < 400) {

      // Get the study model from the hit.
      const study = getStudyModel({ _source: (await response.json() as CMMStudy)});

      // Dispatch the study for display.
      dispatch({
        type: UPDATE_STUDY,
        displayed: study
      });

      // Update similars.
      dispatch(updateSimilars(study));
      
    } else {

      // Study not found, clear the current study from the store.
      dispatch({
        type: UPDATE_STUDY,
        displayed: undefined
      });

      dispatch({ 
        type: UPDATE_SIMILARS,
        similars: []
      });

    }
  };
}

//////////// Redux Action Creator : UPDATE_SIMILARS
export const UPDATE_SIMILARS = "UPDATE_SIMILARS";

export type UpdateSimilarsAction = {
  type: typeof UPDATE_SIMILARS;
  similars: Similar[];
};

export function updateSimilars(item: CMMStudy): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();

    const response = await fetch(`${window.location.origin}/api/sk/_similars/${state.language.currentLanguage.index}/?id=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.titleStudy)}`);

    if (response.status < 400) {
      // Update similars
      dispatch({
        type: UPDATE_SIMILARS,
        similars: (await response.json() as Similar[])
      });

    } else {
      // Remove existing similars
      dispatch({
        type: UPDATE_SIMILARS,
        similars: []
      });
    }
  };
}

////////////

export type DetailAction = 
  | UpdateStudyAction
  | UpdateSimilarsAction;
