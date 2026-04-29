// Copyright CESSDA ERIC 2017-2026
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

import { CMMStudy, Metrics } from "../../common/metadata";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface SearchState {
  loading: boolean;
  showMobileFilters: boolean;
  showAdvancedSearch: boolean;
  showFilterSummary: boolean;
  showAbstract: boolean;
  showKeywords: boolean;
  expandMetadataPanels: boolean;
  displayed: CMMStudy[];
  study: CMMStudy | undefined;
  totalStudies: number;
  metrics: Metrics | undefined;
  shouldResetSearchForm: boolean;
  backToSearchUrl: string | null;
}

export const initialState: SearchState = {
  loading: true,
  showMobileFilters: false,
  showAdvancedSearch: false,
  showFilterSummary: false,
  showAbstract: true,
  showKeywords: true,
  study: undefined,
  expandMetadataPanels: false,
  displayed: [],
  totalStudies: 0,
  metrics: undefined,
  shouldResetSearchForm: false,
  backToSearchUrl: null
};

export const updateMetrics = createAsyncThunk('search/updateMetrics', async (
  { indexBase }: { indexBase: string }, { getState }) => {
  const base = indexBase ?? (getState() as RootState).thematicView.currentIndex.indexName.split('_')[0];

  const response = await fetch(`${window.location.origin}/api/sk/_about_metrics/${base}_*`);

  if (!response.ok) {
    throw new TypeError("Fetching metrics failed");
  }

  return await response.json() as Metrics;
});

export const updateTotalStudies = createAsyncThunk('search/updateTotalStudies', async () => {
  const response = await fetch(`${window.location.origin}/api/sk/_total_studies`);

  if (response.ok) {
    const source = await response.json();
    const totalStudies = source.totalStudies;

    // Return the updated totalStudies value
    return totalStudies;
  } else {
    throw new TypeError("Fetching total studies failed: Response not ok");
  }
});

export const searchSlice = createSlice({
  name: "search",
  initialState: initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = action.payload;
    },
    toggleLoading: (state: SearchState, action: PayloadAction<boolean>) => {
      state.loading = !action.payload;
    },
    toggleSummary: (state: SearchState, action: PayloadAction<boolean>) => {
      state.showFilterSummary = !action.payload;
    },
    toggleAdvancedSearch: (state: SearchState, action: PayloadAction<boolean>) => {
      state.showAdvancedSearch = !action.payload;
    },
    toggleMobileFilters: (state: SearchState, action: PayloadAction<boolean>) => {
      state.showMobileFilters = !action.payload;
    },
    toggleAbstract: (state: SearchState, action: PayloadAction<boolean>) => {
      state.showAbstract = !action.payload;
    },
    toggleKeywords: (state: SearchState, action: PayloadAction<boolean>) => {
      state.showKeywords = !action.payload;
    },
    triggerSearchFormReset: (state) => {
      state.shouldResetSearchForm = true;
    },
    clearSearchFormReset: (state) => {
      state.shouldResetSearchForm = false;
    },
    setBackToSearchUrl: (state, action: PayloadAction<string>) => {
      state.backToSearchUrl = action.payload;
    },
    clearBackToSearchUrl: (state) => {
      state.backToSearchUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateMetrics.fulfilled, (state, action) => {
      state.metrics = action.payload;
    });
    builder.addCase(updateTotalStudies.fulfilled, (state, action) => {
      state.totalStudies = action.payload;
    });
  },
});

export const {
  setMetrics,
  toggleLoading,
  toggleSummary,
  toggleAdvancedSearch,
  toggleMobileFilters,
  toggleAbstract,
  toggleKeywords,
  triggerSearchFormReset,
  clearSearchFormReset,
  setBackToSearchUrl,
  clearBackToSearchUrl,
} = searchSlice.actions;

export default searchSlice.reducer;
