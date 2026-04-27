/* eslint-disable @typescript-eslint/no-require-imports */
// Copyright CESSDA ERIC 2017-2024
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

import React from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { store } from "../store";
import { updateMetrics } from "../reducers/search";
import { useAppSelector } from "../hooks";
import { thematicViews } from "../../common/thematicViews";
import { Metrics } from "../../common/metadata";

const aboutPages = {
  cdc: require('../components/dynamic/pages/aboutPages/CdcAboutPage.tsx').default,
  coordinate: require('../components/dynamic/pages/aboutPages/CoordinateAboutPage.tsx').default,
  covid: require('../components/dynamic/pages/aboutPages/CovidAboutPage.tsx').default,
  hummingbird: require('../components/dynamic/pages/aboutPages/HummingbirdAboutPage.tsx').default,
};

export interface MetricsLoaderData {
  metrics: Metrics;
}

export const metricsLoader = async ({ request }: LoaderFunctionArgs): Promise<MetricsLoaderData> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const segment = pathname.split("/")[1];
  const path = segment ? `/${segment}` : "/";

  const view = thematicViews.find(v => v.path === path) ?? thematicViews.find(v => v.path === "/")!;

  const indexWithoutLang = view.defaultIndex.split("_")[0];

  const metrics = await store.dispatch(
    updateMetrics({ indexBase: indexWithoutLang })
  ).unwrap();

  return { metrics };
};

const AboutPage = () => {
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const { metrics } = useLoaderData<MetricsLoaderData>();
  const DynamicAboutPage = aboutPages[currentThematicView.key as keyof typeof aboutPages];

  return (
    <div className="columns">
      <div className="content-wrapper column is-three-fifths is-offset-one-fifth mt-6 p-2" data-testid="about-page">
        <DynamicAboutPage metrics={metrics} />
      </div>
    </div>
  );
};

export default AboutPage;
