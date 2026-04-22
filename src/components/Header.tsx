/* eslint-disable @typescript-eslint/no-require-imports */
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

import React, { FocusEvent, useState } from "react";
import ThematicViewSwitcher from "./ThematicViewSwitcher";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks";
import { thematicViews, ThematicView } from "../../common/thematicViews";
import { useResetToThematicView } from "../utilities/thematicView";


function toggleClassOnFocusBlur(e: FocusEvent<HTMLElement>, className: string) {
  e.target.classList.toggle(className);
}

const Header = () => {
  const { t } = useTranslation();
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const [isActive, setisActive] = useState(false);
  const defaultThematicView = thematicViews.find((v: ThematicView) => v.path === "/") ?? thematicViews[0];
  const currentCollectionLogo = require("../img/icons/" + currentThematicView.icon);
  const defaultCollectionLogo = require("../img/icons/" + defaultThematicView.icon);

  const buildLogoTarget = (view: ThematicView) => {
    const isRoot = view.path === "/";
    const basePath = isRoot ? "/" : `${view.path}/`;
    const defaultIndexName = view.defaultIndex;
    const search = isRoot ? "" : `?sortBy=${encodeURIComponent(defaultIndexName)}`;
    return `${basePath}${search}`;
  };

  const resetToView = useResetToThematicView();

  const logoTarget = buildLogoTarget(currentThematicView);
  const cdcTarget = buildLogoTarget(defaultThematicView);

  return (
    <header>
      <div className="container columns is-mobile is-vcentered">
        <div className="column is-narrow p-1">
          <div className="columns is-mobile is-vcentered is-gapless">
            {currentThematicView.path !== defaultThematicView.path && (
              <Link to={cdcTarget} onClick={(e) => { e.preventDefault(); resetToView(defaultThematicView); }}>
                <div id="home" className="columns is-mobile is-vcentered is-gapless pr-1">
                  <div className="logo column is-narrow mr-2">
                    <img src={defaultCollectionLogo} alt="CDC Home" />
                  </div>
                </div>
              </Link>
            )}

            <Link to={logoTarget} onClick={(e) => { e.preventDefault(); resetToView(currentThematicView); }}>
              <div id="home" className="columns is-mobile is-vcentered is-gapless pr-1">
                <div className="logo column is-narrow">
                  <img src={currentCollectionLogo} alt="Collection Home" />
                </div>
                <div className="logo-title column is-narrow">
                  <h1>{currentThematicView.title}</h1>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="column is-narrow hidden skip-link-wrapper is-hidden-mobile p-0">
          <a
            href="#main"
            id="skip-to-main"
            className="link is-sr-only"
            onFocus={(e) => toggleClassOnFocusBlur(e, "is-sr-only")}
            onBlur={(e) => toggleClassOnFocusBlur(e, "is-sr-only")}
          >
            &nbsp;{t("header.skipToMain")}&nbsp;
          </a>
        </div>

        <div className="column is-narrow p-0 mln-5">
          <ThematicViewSwitcher />
        </div>

        <div className="column p-0">
          <div className="columns is-vcentered is-justify-content-end p-0">
            <nav className="column navbar is-narrow p-0" aria-label="Main">
              <div className="navbar-brand">
                <a
                  role="button"
                  className={`navbar-burger burger${isActive ? " is-active" : ""}`}
                  data-target="navMenu"
                  onClick={() => setisActive(!isActive)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setisActive(!isActive);
                    }
                  }}
                  aria-label="menu"
                  aria-expanded={isActive}
                  tabIndex={0}
                >
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </a>
              </div>

              <div className={`navbar-menu ${isActive ? "is-active" : ""}`}>
                <Link
                  to={logoTarget}
                  className="link navbar-item is-hidden-mobile is-sr-only"
                  onClick={(e) => { e.preventDefault(); resetToView(currentThematicView); }}
                  onFocus={(e) => toggleClassOnFocusBlur(e, "is-sr-only")}
                  onBlur={(e) => toggleClassOnFocusBlur(e, "is-sr-only")}
                >
                  {t("header.frontPage")}
                </Link>

                <Link
                  to={
                    currentThematicView.path !== "/"
                      ? `${currentThematicView.path}/documentation`
                      : "/documentation"
                  }
                  className="link navbar-item"
                >
                  {t("documentation.label")}
                </Link>

                <Link
                  to={
                    currentThematicView.path !== "/"
                      ? `${currentThematicView.path}/collections`
                      : "/collections"
                  }
                  className="link navbar-item"
                >
                  {t("collections.label")}
                </Link>

                <Link
                  to={
                    currentThematicView.path !== "/"
                      ? `${currentThematicView.path}/about`
                      : "/about"
                  }
                  className="link navbar-item"
                >
                  {t("about.label")}
                </Link>

                <a
                  href="https://api.tech.cessda.eu/"
                  target="_blank"
                  rel="noreferrer"
                  className="link navbar-item"
                >
                  {t("api.label")}
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
