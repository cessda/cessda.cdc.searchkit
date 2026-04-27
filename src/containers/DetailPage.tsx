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

import React, { useEffect } from "react";
import Detail from "../components/Detail"
import { useTranslation } from "react-i18next";
import { UpdateStudyResult, updateStudy } from "../reducers/detail";
import { Link, LoaderFunctionArgs, useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router";
import { store } from "../store";
import { getJsonLd } from '../../common/metadata';
import Similars from "../components/Similars";
import { FaAngleLeft } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Helmet } from "react-helmet-async";
import { clearBackToSearchUrl } from "../reducers/search";
import { getCollectionPath } from "../../common/utils";
import { thematicViews } from "../../common/thematicViews";

type Heading = {
  id: string;
  translation: string;
  level: 'main' | 'title' | 'subtitle';
};

export type HeadingEntry = {
  [key: string]: Heading
};

export interface StudyLoaderData {
  payload: UpdateStudyResult
}

export const studyLoader = async ({ request, params }: LoaderFunctionArgs): Promise<StudyLoaderData> => {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");

  // Derive collection from URL path
  const collectionPath = getCollectionPath(url.pathname);

  const view = thematicViews.find(v => v.path === collectionPath) ?? thematicViews.find(v => v.path === "/")!;

  let indexName = view.defaultIndex;

  if (lang) {
    indexName = indexName.split("_")[0] + "_" + lang;
  }

  const payload = await store.dispatch(
    updateStudy({
      id: params.id as string,
      lang: lang as string,
      // Explicitly provide index
      forceIndex: indexName,
    })
  ).unwrap();

  return { payload };
};

const DetailPage = () => {
  const [searchParams] = useSearchParams();
  const backToSearchUrl = useAppSelector((state) => state.search.backToSearchUrl);
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { payload } = useLoaderData<StudyLoaderData>();

  useEffect(() => {
    return () => {
      dispatch(clearBackToSearchUrl());
    };
  }, [dispatch]);

  useEffect(() => {
    // Update the JSON-LD representation
    const jsonLDElement = document.getElementById("json-ld");

    if (payload.study) {
      const script = document.createElement("script");
      script.id = "json-ld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(getJsonLd(payload.study));

      if (jsonLDElement) {
        jsonLDElement.replaceWith(script);
      } else {
        document.body.appendChild(script);
      }
    } else {
      if (jsonLDElement) {
        jsonLDElement.remove();
      }
    }
  }, [payload]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && backToSearchUrl) {
      event.preventDefault();
      event.stopPropagation();
      navigate(backToSearchUrl);
    }
  }

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`https://datacatalogue.cessda.eu/detail/${location.pathname.split('/').slice(-1)[0]}?lang=${searchParams.get("lang")}`}>
        </link>
      </Helmet>

      <div className="columns">
        <div className="column">
          <div style={{ minHeight: '2.5rem' }}>
            {backToSearchUrl && (
              <div>
                <a className="ais-ClearRefinements-button focus-visible pl-4"
                  tabIndex={0}
                  onClick={() => navigate(backToSearchUrl)}
                  onKeyDown={(e) => handleKeyDown(e)}
                  data-testid="back-button">
                  <span className="icon is-small">
                    <FaAngleLeft />
                  </span>
                  <span>{t("backToSearch")}</span>
                </a>
              </div>
            )}
          </div>
          <div className="columns is-mobile is-flex-wrap-wrap m-0 p-0">
            <div className="column pt-0 is-one-third-desktop is-full-tablet is-full-mobile side-column">
              <Similars similars={payload.similars} />
            </div>

            <div className="column pt-0 is-two-thirds-desktop is-full-tablet is-full-mobile main-column mb-6">
              {payload.study ? (
                <Detail item={payload.study} />
              ) : (
                <div className="pt-15" data-testid="available-languages">
                  <p className="fs-14 mb-15">
                    <strong>{t("language.notAvailable.heading")}</strong>
                  </p>
                  <p className="fs-14 mb-15">
                    {t("language.notAvailable.content")}
                  </p>
                  {payload.availableLanguages.length > 0 && (
                    <p className="fs-14 mb-15">
                      {t("language.notAvailable.alternateLanguage")}:{" "}
                      {payload.availableLanguages.map((lang, index) => (
                        <React.Fragment key={lang.code}>
                          <Link to={`${location.pathname}?lang=${lang.code}`}>
                            {lang.label}
                          </Link>
                          {index < payload.availableLanguages.length - 1 && ", "}
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default DetailPage;
