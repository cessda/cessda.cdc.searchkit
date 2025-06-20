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
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="columns not-found-links">
      <div className="column is-full">
        <h1 className="not-found-title title">{t("notFound.label")}</h1>
        <p className="mb-2">{t("notFound.content")}</p>
        <Link to="/">Return to the home page</Link> | <a href="https://www.cessda.eu">CESSDA main website</a>
      </div>
    </div>
  );
};

export default NotFoundPage;
