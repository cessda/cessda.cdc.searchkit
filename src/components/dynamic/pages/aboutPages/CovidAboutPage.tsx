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
import { Await } from "react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Metrics } from "../../../../../common/metadata";
import { useAppSelector } from "../../../../hooks";
import { metricsLoader } from "../../../../containers/AboutPage";

type DynamicAboutPageProps = {
  metrics: Awaited<ReturnType<typeof metricsLoader>>;
};

const DynamicAboutPage: React.FC<DynamicAboutPageProps> = ({ metrics }) => {
  const { t } = useTranslation();

  type MetricsCircleProps = {
    amount: number;
    description: string;
  };

  const MetricsCircle: React.FC<MetricsCircleProps> = ({ amount, description }) => {
    return (
      <div className="columns is-flex is-flex-direction-column is-vcentered mb-0">
        <div className="metrics-circle m-2">
          <span className="metrics-circle-text">{amount}</span>
        </div>
        <div className="metrics-description">{description}</div>
      </div>
    );
  };
 const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  return (
    <div className="columns is-flex is-flex-direction-column is-vcentered pb-6">
          <Helmet>
                    <title>{currentThematicView.title} - About</title>
                    </Helmet>
      <div className="column is-flex is-flex-wrap-wrap is-justify-content-space-around is-8">
        <React.Suspense fallback={<></>}>
          <Await resolve={metrics} errorElement={<></>}>
            {(metrics: Awaited<ReturnType<typeof metricsLoader>>) => {
              if(metrics.meta.requestStatus === "fulfilled"){
                const payload = metrics.payload as Metrics;
                return (
                  <>
                    <MetricsCircle amount={payload.studies} description={t("about.metrics.studies")} />
                    <MetricsCircle amount={payload.creators} description={t("about.metrics.creators")} />
                    <MetricsCircle amount={payload.countries} description={t("about.metrics.countries")} />
                  </>
                );
              }
              else {
                return <></>
              }
            }}
          </Await>
        </React.Suspense>
      </div>
      <div className="column px-6">
        <h1 className="main-title mb-4">About the By-COVID Project</h1>
        <div className="text-container">
          <p>
          In an unprecedented and unique interdisciplinary effort, BY-COVID has brought together 53 partners from 19 countries and stakeholders from the biomedical field, hospitals, public health, social sciences and humanities.
            </p>
            <p>
          The BY-COVID collection in the CESSDA Data Catalogue contains descriptions of studies on the impact of SARS-CoV-2 and other infectious diseases across scientific, medical, public health and policy domains.
            </p>
        </div>
      </div>

    </div>

  );
};

export default DynamicAboutPage;
