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

import { useNavigate, useLocation } from "react-router";
import { useInstantSearch } from "react-instantsearch";
import { useAppDispatch } from "../hooks";
import { updateThematicView } from "../reducers/thematicView";
import { triggerSearchFormReset } from "../reducers/search";
import { BASE_INDEX, DEFAULT_HITS_PER_PAGE } from "../../common/constants";
import { ThematicView, thematicViews } from "../../common/thematicViews";
import { useEffect } from "react";
import { ensureSlash, getCollectionPath, isSearchRoute } from "../../common/utils";


export function useResetToThematicView() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUiState } = useInstantSearch();

  return (view: ThematicView) => {
    const isRoot = view.path === "/";
    const defaultIndexName = view.defaultIndex;

    // Redux update
    dispatch(
      updateThematicView({
        path: view.path,
        indexName: defaultIndexName,
      })
    );

    dispatch(triggerSearchFormReset());

    // InstantSearch reset
    setUiState((prev) => ({
      ...prev,
      [BASE_INDEX]: {
        ...(prev?.[BASE_INDEX] ?? {}),
        query: undefined,
        page: 1,
        hitsPerPage: DEFAULT_HITS_PER_PAGE,
        refinementList: {},
        range: undefined,
        sortBy: isRoot ? undefined : defaultIndexName,
      },
    }));

    // Navigation with URL as the truth
    const basePath = ensureSlash(view.path);
    const search = isRoot ? "" : `?sortBy=${defaultIndexName}`;
    const target = `${basePath}${search}`;
    const current = location.pathname + location.search;

    navigate(target, { replace: current === target });
  };
}


// Ensures Redux and InstantSearch are initialised from the URL as needed
export function ThematicViewInitialiser() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setUiState } = useInstantSearch();

  useEffect(() => {
    const view =
      thematicViews.find(v => v.path === getCollectionPath(location.pathname)) ??
      thematicViews.find(v => v.path === "/")!;

    dispatch(
      updateThematicView({
        path: view.path,
        indexName: view.defaultIndex,
      })
    );

    // Skip the rest on non-search routes
    if (!isSearchRoute(location.pathname)) {
      return;
    }

    // Canonicalise bare collection URLs
    const hasAnyParams = location.search.length > 1;
    const params = new URLSearchParams(location.search);
    const sortBy = params.get("sortBy");

    if (view.path !== "/" && !sortBy && !hasAnyParams) {
      params.set("sortBy", view.defaultIndex);
      navigate(`${view.path}/?${params.toString()}`, { replace: true });
      return;
    }

    // Only initialise InstantSearch when there is no existing search state
    if (!hasAnyParams) {
      setUiState({
        [BASE_INDEX]: {
          sortBy: sortBy ?? view.defaultIndex,
          page: 1,
        },
      });
    }
  }, [
    location.pathname,
    location.search,
    navigate,
    dispatch,
    setUiState,
  ]);

  return null;
}
