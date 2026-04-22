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

import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../hooks";
import { toggleAbstract, toggleKeywords } from "../reducers/search";

const ToggleButtons = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showAbstract = useAppSelector((state) => state.search.showAbstract);
  const showKeywords = useAppSelector((state) => state.search.showKeywords);

  return (
    <div className="columns is-flex is-narrow mb-0">
      <div className="column field is-narrow toggle-button p-0">
        <input id="toggle-abstract" type="checkbox" name="toggle-abstract" className="switch is-rounded is-info"
              checked={showAbstract} onChange={() => dispatch(toggleAbstract(showAbstract))} />
        <label htmlFor="toggle-abstract" className="pr-2 mr-2">{t("showAbstract")}</label>
      </div>
      <div className="column field is-narrow toggle-button p-0">
        <input id="toggle-keywords" type="checkbox" name="toggle-keywords" className="switch is-rounded is-info"
            checked={showKeywords} onChange={() => dispatch(toggleKeywords(showKeywords))} />
        <label htmlFor="toggle-keywords" className="pr-2 mr-2">{t("showKeywords")}</label>
      </div>
    </div>
  );
};

export default ToggleButtons;
