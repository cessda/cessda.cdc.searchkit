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

import { useTranslation } from "react-i18next";
import React from "react";
import { useInstantSearch } from "react-instantsearch";
import { useAppSelector } from "../hooks";
import { BASE_INDEX, SORT_OPTIONS } from "../../common/constants"
import { indexBaseFromSortBy } from "../../common/utils";

/**
 * Sort by element with main functionality from React InstantSearch.
 *
 * @returns sort by element
 */
const CustomSortBy = () => {
  const { t } = useTranslation();
  const reduxView = useAppSelector((state) => state.thematicView.currentThematicView);
  const { uiState, setUiState } = useInstantSearch();

  const currentSortBy = (uiState?.[BASE_INDEX]?.sortBy as string | undefined) ?? BASE_INDEX;

  // Prefer collection defaultIndex as fallback
  const fallbackBase = reduxView?.defaultIndex ?? BASE_INDEX;

  const indexBase = indexBaseFromSortBy(currentSortBy, fallbackBase);

  // Visible dropdown only shows sorts for the current base language index
  const options = React.useMemo(
    () =>
      SORT_OPTIONS.map((opt) => ({
        value: `${indexBase}${opt.suffix}`,
        label: t(opt.i18nKey),
      })),
    [indexBase, t]
  );

  // Ensure the <select> value matches one of the visible options
  const selectValue = currentSortBy === indexBase || currentSortBy.startsWith(`${indexBase}_`) ? currentSortBy : indexBase;

  return (
    <select
      className="ais-SortBy-select focus-visible"
      aria-label={t('sortBy')}
      value={selectValue}
      onChange={(e) => {
        const next = e.target.value;

        setUiState((prev) => ({
          ...prev,
          [BASE_INDEX]: {
            ...(prev[BASE_INDEX] ?? {}),
            sortBy: next === BASE_INDEX ? undefined : next,
            page: 1, // Reset page on sort change
          },
        }));
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="ais-SortBy-option">
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default CustomSortBy;
