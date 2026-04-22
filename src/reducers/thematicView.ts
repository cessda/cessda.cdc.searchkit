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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThematicView, thematicViews, EsIndex } from "../../common/thematicViews";

export interface ThematicViewState {
  currentThematicView: ThematicView;
  list: readonly ThematicView[];
  currentIndex: EsIndex;
}

// Resolve a thematic view by path with a guaranteed fallback
function resolveView(path: string, fallback: ThematicView): ThematicView {
  return (
    thematicViews.find((v) => v.path === path) ??
    thematicViews.find((v) => v.path === "/") ??
    fallback
  );
}

/**
 * Resolve an index within a view only
 * Order of precedence:
 *  1. Explicit indexName match
 *  2. View defaultIndex
 *  3. English index
 *  4. First available index
 */
function resolveIndex(view: ThematicView, indexName?: string): EsIndex {
  if (indexName) {
    const found = view.esIndexes.find((i) => i.indexName === indexName);
    if (found) return found;
  }

  return (
    view.esIndexes.find((i) => i.indexName === view.defaultIndex) ??
    view.esIndexes.find((i) => i.languageCode === "en") ??
    view.esIndexes[0]
  );
}

// Minimal and deterministic initial state
const rootView = thematicViews.find((v) => v.path === "/") ?? thematicViews[0];

export const initialState: ThematicViewState = {
  currentThematicView: rootView,
  list: thematicViews,
  currentIndex:
    rootView.esIndexes.find((i) => i.indexName === rootView.defaultIndex) ??
    rootView.esIndexes.find((i) => i.languageCode === "en") ??
    rootView.esIndexes[0],
};

const thematicViewSlice = createSlice({
  name: "thematicView",
  initialState,
  reducers: {
    /**
     * Authoritative update based on path
     * The index is always validated against the resolved view
     */
    updateThematicView: (state, action: PayloadAction<{ path: string; indexName?: string; }>) => {
      const view = resolveView(
        action.payload.path,
        state.currentThematicView
      );
      const index = resolveIndex(
        view,
        action.payload.indexName
      );

      state.currentThematicView = view;
      state.currentIndex = index;
    },
  },
});

export const { updateThematicView } = thematicViewSlice.actions;

export default thematicViewSlice.reducer;
