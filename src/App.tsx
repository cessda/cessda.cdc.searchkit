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

import React, { useEffect, useRef, useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation, ScrollRestoration, RouteObject } from "react-router-dom";
import SearchPage, { getSortByItems } from "./containers/SearchPage";
import DetailPage, { studyLoader } from "./containers/DetailPage";
import AboutPage, { metricsLoader } from "./containers/AboutPage";
import RestApiPage from "./containers/RestApiPage";
import UserGuidePage from "./containers/UserGuidePage";
import AccessibilityStatementPage from "./containers/AccessibilityStatementPage";
import CollectionsPage from "./containers/CollectionsPage";
import NotFoundPage from "./containers/NotFoundPage";
import ErrorPage from "./containers/ErrorPage";
import { InstantSearch } from "react-instantsearch";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { VirtualRefinementList, VirtualRangeInput, VirtualSortBy } from "./components/VirtualComponents";
import searchClient from "./utilities/searchkit";
import { history } from "instantsearch.js/es/lib/routers";
import { useAppSelector } from "./hooks";
import { useTranslation } from "react-i18next";
import { thematicViews } from "../common/thematicViews";
import { Helmet } from "react-helmet-async";
import IndexSwitcher from "./components/IndexSwitcher";
import CustomSearchBox from "./components/CustomSearchBox";
import { useMatomoTracking, useSearchTracking } from "./hooks";


const MatomoWrapper = () => {
  useMatomoTracking();
  useSearchTracking();
  return null;
};

const Root = () => {
  const { t } = useTranslation();
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);
  const [queryError, setQueryError] = useState<string | null>(null);

  const locationHook = useLocation();

  const faviconFolder = require.context('./img/favicons/', true, /\.(jpe?g|png|gif|svg)$/)
  const faviconImg = faviconFolder(`./${currentThematicView.favicon}`);

  // Create an array of all the sortBy options for all the languages
  let virtualSortByItems: { value: string, label: string }[] = [];
  currentThematicView.esIndexes.forEach(esIndex => {
    const sortByItems = getSortByItems(esIndex.indexName, t);
    virtualSortByItems = virtualSortByItems.concat(sortByItems);
  });

  const onUpdateRef = useRef(() => { });

  useEffect(() => {
    onUpdateRef.current();
  }, [locationHook.search]);

  const routing = {
    router: history({
      // Synchronize InstantSearch’s router with changes to query params in react-router (location.search)
      start(onUpdate) {
        onUpdateRef.current = onUpdate;
      },
      parseURL({ qsModule, location }) {
        return qsModule.parse(location.search.slice(1));
      },
      createURL({ qsModule, location, routeState }) {
        const { origin, pathname, hash } = location;

        // Parse existing query parameters from the URL
        const existingParams = qsModule.parse(location.search.slice(1));

        // Merge existing query params with the new route state
        const combinedQueryParams = { ...existingParams, ...routeState };

        // Create the query string using qs with proper array formatting
        const queryString = qsModule.stringify(combinedQueryParams, {
          addQueryPrefix: true,
          arrayFormat: 'brackets', // Produces ?key[]=value1&key[]=value2
        });

        return `${origin}${pathname}${queryString}${hash}`;
      },

      // Whether the URL is cleaned up from active refinements when the router is disposed of
      cleanUrlOnDispose: true,
      // Number of milliseconds the router waits before writing the new URL to the browser
      writeDelay: 400
    }),
    stateMapping: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateToRoute(uiState: any) {
        const indexUiState = uiState[currentIndex.indexName] || {};

        return {
          query: indexUiState.query,
          classifications: indexUiState.refinementList?.classifications,
          keywords: indexUiState.refinementList?.keywords,
          dataAccess: indexUiState.refinementList?.dataAccess,
          collectionYear: indexUiState.range?.collectionYear,
          country: indexUiState.refinementList?.country,
          publisher: indexUiState.refinementList?.publisher,
          timeMethod: indexUiState.refinementList?.timeMethod,
          timeMethodCV: indexUiState.refinementList?.timeMethodCV,
          resultsPerPage: indexUiState.hitsPerPage,
          page: indexUiState.page,
          // Could remove the common part of index name but would need to check what else needs to be changed
          // elsewhere, e.g. Header, LanguageSelector, DetailPage, SearchPage, and how it works
          sortBy: indexUiState.sortBy  // && indexUiState.sortBy.replace('coordinate_', '')
        };

      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routeToState(routeState: any) {
        return {
          [currentIndex.indexName]: {
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

  };

  return (

    <InstantSearch searchClient={searchClient}
      indexName={currentIndex.indexName}
      // routing can't use updated values from redux store when key is null
      // Could use index as key to make sure everything is always perfect and store values could be used but
      // then it re-renders even when not really needed (like switching language on detail page)

      // key={currentIndex.indexName}
      routing={routing}
      // routing={true}
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
          <div className="columns mx-4 mt-2">
            <div className="searchwrapper columns is-flex-direction-column is-mobile is-narrow mx-auto is-gapless mt-4 mb-2 p-2">
              <div className="columns is-flex-direction-row is-mobile is-narrow mx-auto is-gapless mb-1">
                <div className="column is-narrow">
                  <IndexSwitcher />
                </div>
                <div className="column is-narrow pb-0">
                  <CustomSearchBox setQueryError={setQueryError} />
                </div>
              </div>
              {queryError && (
                <div className="notification is-danger is-light mb-0">
                  {queryError}
                </div>
              )}
            </div>
          </div>

          <VirtualRefinementList attribute="virtual" />
          <VirtualRangeInput attribute="virtual" />
          <VirtualSortBy items={virtualSortByItems} />

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
      { path: "about", element: <AboutPage />, loader: metricsLoader },
      { path: "detail/:id", element: <DetailPage />, loader: studyLoader },
      { path: "documentation", element: <UserGuidePage /> },
      { path: "rest-api", element: <RestApiPage /> },
      { path: "accessibility-statement", element: <AccessibilityStatementPage /> },
      { path: "collections", element: <CollectionsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  })
}
);
const router = createBrowserRouter(routes);
const App = () => {

  return (

    <RouterProvider router={router} />

  );
};

export default App;
