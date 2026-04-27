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

import React, { useEffect, useMemo, useRef } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  RouteObject,
  useNavigate
} from "react-router";
import SearchPage from "./containers/SearchPage";
import DetailPage, { studyLoader } from "./containers/DetailPage";
import AboutPage, { metricsLoader } from "./containers/AboutPage";
import UserGuidePage from "./containers/UserGuidePage";
import AccessibilityStatementPage from "./containers/AccessibilityStatementPage";
import CollectionsPage from "./containers/CollectionsPage";
import NotFoundPage from "./containers/NotFoundPage";
import ErrorPage from "./containers/ErrorPage";
import { InstantSearch } from "react-instantsearch";
import Footer from "./components/Footer";
import Header from "./components/Header";
import {
  VirtualRefinementList,
  VirtualRangeInput,
  VirtualSortBy,
  VirtualPagination,
  VirtualHitsPerPage,
  VirtualSearchBox
} from "./components/VirtualComponents";
import searchClient from "./utilities/searchkit";
import { history } from "instantsearch.js/es/lib/routers";
import { useAppSelector } from "./hooks";
import { thematicViews } from "../common/thematicViews";
import { Helmet } from "react-helmet-async";
import { useMatomoTracking, useSearchTracking } from "./hooks";
import { BASE_INDEX, SORT_OPTIONS } from "../common/constants";
import { indexBaseFromSortBy, getCollectionPath, isSearchRoute } from "../common/utils";
import { ThematicViewInitialiser } from "./utilities/thematicView";


const MatomoWrapper = () => {
  useMatomoTracking();
  useSearchTracking();
  return null;
};

function buildGlobalSortByItems() {
  // Unique base index names across all collections
  const baseIndexes = Array.from(
    new Set(thematicViews.flatMap((tv) => tv.esIndexes.map((i) => i.indexName)))
  );

  // Build items for every base index + every suffix
  return baseIndexes.flatMap((base) =>
    SORT_OPTIONS.map((opt) => ({
      value: `${base}${opt.suffix}`,
      // Label is irrelevant for virtual widget
      label: `${base}${opt.suffix || ""}`,
    }))
  );
}

const Root = () => {
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const navigate = useNavigate();
  const faviconFolder = require.context('./img/favicons/', true, /\.(jpe?g|png|gif|svg)$/)
  const faviconImg = faviconFolder(`./${currentThematicView.favicon}`);

  // Create an array of all the sortBy options for all the languages
  const virtualSortByItems = useMemo(
    () => buildGlobalSortByItems(), []
  );

  // Update body class to match selected collection
  useEffect(() => {
    document.body.className = currentThematicView.rootClass;
  }, [currentThematicView.rootClass]);

  const onUpdateRef = useRef<() => void>(() => { });

  useEffect(() => {
    // Only notify InstantSearch when on search route
    if (!isSearchRoute(location.pathname)) return;

    onUpdateRef.current?.();
  }, [location.pathname, location.search, location.hash]);

  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  const routing = useMemo(() => ({
    router: history({
      // Synchronize InstantSearch’s router with changes to query params in react-router (location.search)
      start(onUpdate) {
        onUpdateRef.current = onUpdate;
      },
      parseURL({ qsModule, location }) {
        return qsModule.parse(location.search.slice(1));
      },
      createURL({ qsModule, location, routeState }) {
        const { origin, pathname, hash, search } = location;

        const existingParams = qsModule.parse(search.slice(1));
        const nextParams = { ...existingParams };

        for (const [key, value] of Object.entries(routeState)) {
          if (value === undefined) {
            delete nextParams[key]; // Remove stale params
          } else {
            nextParams[key] = value;
          }
        }

        const queryString = qsModule.stringify(nextParams, {
          addQueryPrefix: true,
          arrayFormat: 'brackets', // Produces ?key[]=value1&key[]=value2
        });

        return `${origin}${pathname}${queryString}${hash}`;
      },
      push(url) {
        const u = new URL(url, window.location.origin);

        navigate({ pathname: u.pathname, search: u.search, hash: u.hash }, { replace: false });
      },
      // Whether the URL is cleaned up from active refinements when the router is disposed of
      cleanUrlOnDispose: true,
      // Number of milliseconds the router waits before writing the new URL to the browser
      writeDelay: 50
    }),
    stateMapping: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateToRoute(uiState: any) {
        const pathname = locationRef.current.pathname;

        // Not active outside of search route
        if (!isSearchRoute(pathname)) {
          return {};
        }

        const indexUiState = uiState[BASE_INDEX] ?? {};
        const currentSortBy: string = indexUiState.sortBy ?? BASE_INDEX;

        const collectionPath = getCollectionPath(pathname);

        const activeCollection =
          thematicViews.find(tv => tv.path === collectionPath) ??
          thematicViews.find(tv => tv.path === "/");

        if (!activeCollection) {
          return {};
        }

        const indexBase = indexBaseFromSortBy(currentSortBy, BASE_INDEX);
        const belongsToCollection = activeCollection.esIndexes.some(idx => idx.indexName === indexBase);

        // Only hide base/default index on root
        const isRootDefault = collectionPath === "/" && currentSortBy === BASE_INDEX;

        return {
          query: indexUiState.query,
          classifications: indexUiState.refinementList?.classifications?.length ? indexUiState.refinementList.classifications : undefined,
          keywords: indexUiState.refinementList?.keywords?.length ? indexUiState.refinementList.keywords : undefined,
          dataAccess: indexUiState.refinementList?.dataAccess?.length ? indexUiState.refinementList.dataAccess : undefined,
          collectionYear: indexUiState.range?.collectionYear ?? undefined,
          country: indexUiState.refinementList?.country?.length ? indexUiState.refinementList.country : undefined,
          publisher: indexUiState.refinementList?.publisher?.length ? indexUiState.refinementList.publisher : undefined,
          timeMethod: indexUiState.refinementList?.timeMethod?.length ? indexUiState.refinementList.timeMethod : undefined,
          timeMethodCV: indexUiState.refinementList?.timeMethodCV?.length ? indexUiState.refinementList.timeMethodCV : undefined,
          resultsPerPage: indexUiState.hitsPerPage,
          page: indexUiState.page,
          sortBy:
            belongsToCollection && !isRootDefault
              ? currentSortBy // Full value including sort option
              : undefined,
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routeToState(routeState: any) {
        return {
          [BASE_INDEX]: {
            query: routeState.query,
            refinementList: {
              classifications: routeState.classifications || [],
              keywords: routeState.keywords || [],
              dataAccess: routeState.dataAccess || [],
              country: routeState.country || [],
              publisher: routeState.publisher || [],
              timeMethod: routeState.timeMethod || [],
              timeMethodCV: routeState.timeMethodCV || []
            },
            range: routeState.collectionYear ? {
              collectionYear: routeState.collectionYear,
            } : undefined,
            hitsPerPage: routeState.resultsPerPage,
            page: routeState.page,
            sortBy: routeState.sortBy
          },
        };
      }
    },

  }), [navigate]);

  return (

    <InstantSearch searchClient={searchClient}
      indexName={BASE_INDEX}
      routing={routing}
      future={{
        // If false, each widget unmounting will also remove its state, even if multiple widgets read that UI state
        // If true, each widget unmounting will only remove its state if it's the last of its type
        preserveSharedStateOnUnmount: true
      }}>

      <MatomoWrapper />

      <Helmet>
        <link rel="shortcut icon" href={faviconImg} />
        <link rel="apple-touch-icon" href={faviconImg}></link>
        <link rel="icon" type="image/png" href={faviconImg}></link>
      </Helmet>

      <Header />

      <main id="main">
        <div className="container">
          <VirtualSearchBox />
          <VirtualPagination />
          <VirtualHitsPerPage />
          <VirtualSortBy items={virtualSortByItems} />
          <VirtualRefinementList attribute="classifications" />
          <VirtualRefinementList attribute="keywords" />
          <VirtualRefinementList attribute="dataAccess" />
          <VirtualRefinementList attribute="country" />
          <VirtualRefinementList attribute="publisher" />
          <VirtualRefinementList attribute="timeMethod" />
          <VirtualRefinementList attribute="timeMethodCV" />
          <VirtualRangeInput attribute="collectionYear" />
          <ThematicViewInitialiser />
          <Outlet />
        </div>
      </main>

      <Footer />
      <ScrollRestoration />
    </InstantSearch>
  );
};


// (OC 11.2024) Build Thematic View routes from paths in src/utilities/thematicViews.ts
const routes: RouteObject[] = thematicViews.map(thematicView => {
  return ({
    path: thematicView.path,
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <SearchPage /> },
      { path: "about", element: <AboutPage />, loader: metricsLoader, HydrateFallback: () => null },
      { path: "detail/:id", element: <DetailPage />, loader: studyLoader, HydrateFallback: () => null },
      { path: "documentation", element: <UserGuidePage /> },
      { path: "accessibility-statement", element: <AccessibilityStatementPage /> },
      { path: "collections", element: <CollectionsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  })
});
const router = createBrowserRouter(routes);
const App = () => {

  return (

    <RouterProvider router={router} />

  );
};

export default App;
