// Copyright CESSDA ERIC 2017-2025
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

import { CMMStudy, getStudyModel, Similar } from "../../common/metadata";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Language, languageMap } from "../utilities/language";
import { ThematicViewState } from "./thematicView";


export interface DetailState {
  availableLanguages: Language[];
  study: CMMStudy | undefined;
  similars: Similar[];
}

const initialState: DetailState = {
  availableLanguages: [],
  study: undefined,
  similars: [],
};

export const updateStudy = createAsyncThunk('search/updateStudy', async ({ id, lang }: { id: string, lang: string }, { getState }) => {


  const { thematicView } = getState() as { thematicView: ThematicViewState };
  let study = undefined;
  let similars: Similar[] = [];
  const availableLanguages: Language[] = [];
  const currentLang = thematicView.currentIndex.indexName.split("_")[1];

  let fetchIndex = thematicView.currentIndex.indexName;

  if (lang && lang != currentLang) {
    fetchIndex = thematicView.currentIndex.indexName.split("_")[0] + "_" + lang;
  }
  
  const response = await fetch(`${window.location.origin}/api/sk/_get/${fetchIndex}/${encodeURIComponent(id)}`);

  if (response.ok) {

    // Get the study model from the hit.
    const json = await response.json() as { source: CMMStudy, similars: Similar[] };
    study = getStudyModel(json.source);
    similars = json.similars

  } else if (response.status === 404) {
    // If 404, get the languages that the study is available in
    const languageCodes = await response.json() as string[];

    for (const code of languageCodes) {
      const lang = languageMap.get(code);
      if (lang) {
        availableLanguages.push(lang);
      }
    }
  }

  return { study: study, similars: similars, availableLanguages: availableLanguages };
});

const detailSlice = createSlice({
  name: "detail",
  initialState: initialState,
  reducers: {
    clearStudy(state: DetailState) {
      //state.languageAvailableIn = ;
      state.study = undefined;
      state.similars = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateStudy.fulfilled, (state, action) => {
      state.study = action.payload.study;
      state.similars = action.payload.similars;
    });
  },
});

export const { clearStudy } = detailSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectShowAdvancedSearch = (state: RootState) =>
//   state.showAdvancedSearch;

export default detailSlice.reducer;

// import { CMMStudy, Similar } from "../../common/metadata";
// import { Action } from "../actions";
// import { CLEAR_STUDY, UPDATE_STUDY } from "../actions/detail";
// import { Language } from "../utilities/language";

// export interface DetailState {
//   languageAvailableIn: Language[],
//   study: CMMStudy | undefined;
//   similars: Similar[];
// }

// const initialState: DetailState = {
//   languageAvailableIn: [],
//   study: undefined,
//   similars: []
// }

// const detailReducer = (state: DetailState =  initialState, action: Action) => {
//   switch(action.type) {
//     case CLEAR_STUDY: {
//       return Object.assign({}, state, {
//         languageAvailableIn: action.languageAvailableIn,
//         study: undefined,
//         similars: []
//       });
//     }

//     case UPDATE_STUDY: {
//       return Object.assign({}, state, {
//         languageAvailableIn: [],
//         study: action.displayed,
//         similars: action.similars
//       });
//     }

//     default:
//       return state;
//   }
// }

// export default detailReducer;
