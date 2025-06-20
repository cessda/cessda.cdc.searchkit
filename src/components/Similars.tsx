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

import React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Similar } from "../../common/metadata";
import { useAppSelector } from "../hooks";
import { useSearchParams } from "react-router";

export interface Props {
  similars: Similar[];
}

const Similars = (props: Props) => {
  const { t } = useTranslation();
  const similars = props.similars;
  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const viewPrefix = currentThematicView.path === "/" ? "" : currentThematicView.path;
  const links: React.JSX.Element[] = [];
 const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') || currentIndex.languageCode;
  for (let i = 0; i < similars.length; i++) {
    // Construct the similar URL
    links.push(
      
      <Link key={i} to={viewPrefix + "/detail/" + similars[i].id + "?lang=" + lang} >
        {similars[i].title}
      </Link>
    );
  }

  return (
    <div className="similars filter-wrapper">
      <h2>{t("similarResults.heading")}</h2>
      {links.length > 0 ? (
        <ul>
          {links.map((link, index) => (
            <li key={index}>
              {link}
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          <li>
            <p>{t("similarResults.notAvailable")}</p>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Similars;
