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

import { useEffect } from "react";
import {
  useCurrentRefinements,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";
import { useAppSelector } from "../hooks";
import { BASE_INDEX } from "../../common/constants";
import { indexBaseFromSortBy } from "../../common/utils";

const RELEVANCE_ATTRIBUTES = new Set([
  "classifications",
  "keywords",
  "timeMethod",
]);

/**
 * Automatically uses relevance sorting when a search query has been entered or user has
 * selected any of the specified filters. User's manual sort selection takes precedence.
 */
const AutomaticSort = () => {
  const currentThematicView = useAppSelector(state => state.thematicView.currentThematicView);
  const isSortManuallySelected = useAppSelector(state => state.search.isSortManuallySelected);
  const { query } = useSearchBox();
  const { items: currentRefinements } = useCurrentRefinements();
  const { uiState, setUiState } = useInstantSearch();

  const fallbackBase = currentThematicView.defaultIndex ?? BASE_INDEX;

  const currentSortBy = (uiState?.[BASE_INDEX]?.sortBy as string | undefined) ?? fallbackBase;

  // Everything but default sort and relevance sort is treated as manually selected even if
  // 'isSortManuallySelected' hasn't been set to true, e.g. following a link with a manually selected sort
  const hasExplicitManualSort =
    currentSortBy !== fallbackBase &&
    currentSortBy !== BASE_INDEX &&
    !currentSortBy.endsWith("_relevance");

  // Extract the underlying index from sort variants such, e.g. cmmstudy_en_relevance -> cmmstudy_en
  const indexBase = indexBaseFromSortBy(currentSortBy, fallbackBase);

  const hasRelevanceRefinement = currentRefinements.some(item => RELEVANCE_ATTRIBUTES.has(item.attribute));

  // Relevance is used whenever the user enters a search query or selects any of the defined filters
  const shouldUseRelevance = query.trim().length > 0 || hasRelevanceRefinement;

  const automaticSortBy = shouldUseRelevance ? `${indexBase}_relevance` : indexBase;

  useEffect(() => {
    // Do not override an explicit sort selection made by the user and
    // avoid unnecessary uiState updates if the correct sort is already active
    if (isSortManuallySelected || hasExplicitManualSort || currentSortBy === automaticSortBy) {
      return;
    }

    setUiState(prev => ({
      ...prev,
      [BASE_INDEX]: {
        ...(prev[BASE_INDEX] ?? {}),
        sortBy: automaticSortBy === BASE_INDEX ? undefined : automaticSortBy,
        page: 1,
      },
    }));
  }, [
    automaticSortBy,
    currentSortBy,
    isSortManuallySelected,
    setUiState,
  ]);

  return null;
};

export default AutomaticSort;
