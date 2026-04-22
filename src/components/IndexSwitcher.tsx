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

import React, { useMemo } from "react";
import Select from "react-select";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useInstantSearch } from "react-instantsearch";
import getPaq from "../utilities/getPaq";
import { updateThematicView } from "../reducers/thematicView";
import { BASE_INDEX } from "../../common/constants";
import { useLocation, useNavigate } from "react-router";
import { indexBaseFromSortBy, ensureSlash } from "../../common/utils";

interface SelectOption {
  value: {
    path: string;
    indexName: string;
  };
  label: string;
}

const IndexSwitcher = () => {
  const { currentThematicView: currentView, currentIndex } = useAppSelector((s) => s.thematicView);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { uiState, setUiState } = useInstantSearch();
  const location = useLocation();
  const isDetail = location.pathname.includes("/detail/");

  const esIndexOptions: SelectOption[] = currentView.esIndexes.map(
    (esIndex) => ({
      label: esIndex.language,
      value: {
        path: currentView.path,
        indexName: esIndex.indexName,
      },
    })
  );

  const effectiveLanguageIndex = isDetail
    ? currentIndex.indexName
    : indexBaseFromSortBy(
      uiState?.[BASE_INDEX]?.sortBy,
      BASE_INDEX
    );

  const selectedOption = useMemo(() => {
    return (
      esIndexOptions.find((o) => o.value.indexName === effectiveLanguageIndex) ??
      esIndexOptions.find((o) => o.value.indexName === BASE_INDEX) ??
      null
    );
  }, [esIndexOptions, effectiveLanguageIndex]);

  const changeIndex = (option: SelectOption) => {
    const nextIndex = option.value.indexName;
    const isBase = nextIndex === BASE_INDEX;

    // Matomo
    const esIndex = currentView.esIndexes.find(
      (i) => i.indexName === nextIndex
    );
    if (esIndex) {
      const _paq = getPaq();
      _paq.push([
        "trackEvent",
        "Language",
        "Change Language",
        esIndex.languageCode.toUpperCase(),
      ]);
    }

    // Reset InstantSearch state defensively
    setUiState((prev) => ({
      ...prev,
      [BASE_INDEX]: {
        sortBy: isBase ? undefined : nextIndex,
        page: 1,
      },
    }));

    const search = isBase ? "" : `?sortBy=${nextIndex}`;
    navigate(`${ensureSlash(currentView.path)}${search}`, {
      replace: location.search === search,
    });

    dispatch(
      updateThematicView({
        path: currentView.path,
        indexName: nextIndex,
      })
    );
  };

  return (
    <div className="language-picker">
      <Select
        key={`${currentView.key}-${currentIndex.indexName}`} // Re-init on index/view change
        classNamePrefix="react-select"
        value={selectedOption}
        options={esIndexOptions}
        isSearchable={false}
        aria-label="Search language"
        isClearable={false}
        onChange={(opt) => opt && changeIndex(opt)}
        getOptionValue={(o) => o.value.indexName}
        classNames={{
          control: (state) => (state.isFocused ? "is-focused" : ""),
        }}
        styles={{
          menu: (base) => ({ ...base, marginTop: "0" }),
          control: (base) => ({
            ...base,
            boxShadow: "none",
            outline: "none",
          }),
        }}
      />
    </div>
  );
};

export default IndexSwitcher;
