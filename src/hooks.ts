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

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { useInstantSearch } from "react-instantsearch";
import getPaq from "./utilities/getPaq";

// Redux hooks
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Matomo tracking hook
export const useMatomoTracking = () => {
  const location = useLocation();
  const _paq = getPaq();

  useEffect(() => {
    // Notify Matomo Analytics of page change
    const path = location.pathname + location.search;
    _paq.push(["setReferrerUrl", path]);
    _paq.push(["setCustomUrl", path]);
    _paq.push(["setDocumentTitle", "CESSDA Data Catalogue"]);

    // Remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
    _paq.push(["deleteCustomVariables", "page"]);
    _paq.push(["trackPageView"]);

    // Make Matomo aware of newly added content
    const content = document.getElementById("root");
    if (content) {
      _paq.push(["MediaAnalytics::scanForMedia", content]);
      _paq.push(["FormAnalytics::scanForForms", content]);
      _paq.push(["trackContentImpressionsWithinNode", content]);
    }
    _paq.push(["enableLinkTracking"]);
  }, [location]);
};

// Search tracking hook
export const useSearchTracking = () => {
  const { results, status } = useInstantSearch();

  useEffect(() => {
    if (status === "idle" && results?.query) {
      const _paq = getPaq();
      _paq.push(["trackEvent", "Search", "Query", results.query]);
    }
  }, [results?.query, status]);
};
