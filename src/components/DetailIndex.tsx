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
import { HeadingEntry } from "../containers/DetailPage";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export interface Props {
  headings: HeadingEntry[];
}

const DetailIndex = ({ headings }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="float index">
      <h2 className="main mb-2">{t("index")}</h2>
      <ul>
        {headings.map((entry) => {
          const key = Object.keys(entry)[0]; // Get the key of the current entry
          const { id, level, translation } = entry[key];
          const classNames = level === 'main' ? 'mb-2' : (level === 'title' ? 'mt-4 mb-2' : '');

          return (
            <li key={id} className={classNames}>
              <Link to={`#${id}`} className={level} preventScrollReset={true}>{translation}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DetailIndex;
