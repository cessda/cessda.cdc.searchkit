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
      <div className="column is-flex is-flex-wrap-wrap is-justify-content-space-around">
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
        <h1 className="main-title mb-4">About the COORDINATE Portal</h1>
      
        <div className="text-container">
          <p>The aim of the COORDINATE project is to mobilise the community of researchers and organisations that will drive forwards the coordinated development of comparative birth cohort panel and associated survey research in Europe which focus on children&apos;s wellbeing.</p>
          <p>The infrastructural community network brought together by COORDINATE will promote the harmonisation of and improve access to international survey data, in particular panel survey data, in the study of children and young people&apos;s wellbeing as they grow up.</p>
          <p>The research that COORDINATE will complete, using a child-centric approach, continues the research initiated in the <a href="https://cordis.europa.eu/project/id/613368" target="_blank" rel="noreferrer">&apos;Measuring Youth Well-Being&apos; (MyWEB)</a> and the <a href="https://cordis.europa.eu/project/id/777449" target="_blank" rel="noreferrer">&apos;European Cohort Development Project&apos; (ECDP)</a> projects, which will support elements of the preparatory phase of Europe&apos;s first cross-national accelerated birth cohort survey of child well-being: - Growing Up in Digital Europe (GUIDE).</p>
          <p>The COORDINATE Portal is a collection in the <a href="https://datacatalogue.cessda.eu" target="_blank" rel="noreferrer">CESSDA Data Catalogue</a> and licensed with <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer">Apache License 2.0</a>.
          </p>
        
        </div>
      </div>

      </div>

  );
};

export default DynamicAboutPage;
