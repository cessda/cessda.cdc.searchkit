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

import { CMMStudy, Similar } from "../../common/metadata";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Language, languageMap } from "../utilities/language";
import { ThematicViewState } from "./thematicView";
import MetadataUtils from "../utilities/metadata";


export interface DetailState {
  availableLanguages: Language[];
  study: CMMStudy | undefined;
  similars: Similar[];
  showAllFields: boolean;
}

const initialState: DetailState = {
  availableLanguages: [],
  study: undefined,
  similars: [],
  showAllFields: false
};

export interface UpdateStudyPayload { 
  study: CMMStudy | undefined; 
  similars: Similar[]; 
  availableLanguages: Language[]; 
}

export const updateStudy = createAsyncThunk('search/updateStudy', async ({ id, lang }: { id: string, lang: string }, { getState }): Promise<UpdateStudyPayload> => {


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
    study = MetadataUtils.getStudyModel(json.source);
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
      state.study = undefined;
      state.similars = [];
    },
    toggleAllFields: (state: DetailState, action: PayloadAction<boolean>) => {
      state.showAllFields = !action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateStudy.fulfilled, (state, action) => {
      state.study = action.payload.study;
      state.similars = action.payload.similars;
    });
  },
});

export const { clearStudy, toggleAllFields } = detailSlice.actions;

export default detailSlice.reducer;
