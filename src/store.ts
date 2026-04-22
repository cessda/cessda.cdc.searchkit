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

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import searchReducer from "./reducers/search";
import detailReducer from "./reducers/detail";
import thematicViewReducer from "./reducers/thematicView";

/**
 * Export the root reducer so tests can reuse it
 */
export const rootReducer = combineReducers({
  search: searchReducer,
  detail: detailReducer,
  thematicView: thematicViewReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
