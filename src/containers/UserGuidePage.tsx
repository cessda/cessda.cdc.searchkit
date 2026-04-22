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

import React from "react";
import { useAppSelector } from "../hooks";

const userGuidePages = {
  cdc: require('../components/dynamic/pages/userGuidePages/CdcUserGuidePage.tsx').default,
  coordinate: require('../components//dynamic/pages/userGuidePages/CoordinateUserGuidePage.tsx').default,
  hummingbird: require('../components//dynamic/pages/userGuidePages/HummingbirdUserGuidePage.tsx').default,
  covid: require('../components//dynamic/pages/userGuidePages/CovidUserGuidePage.tsx').default,
};

const UserGuidePage = () => {
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const DynamicUserGuidePage = userGuidePages[currentThematicView.key as keyof typeof userGuidePages];

  return (
    <div className="columns">
      <div className="content-wrapper column is-three-fifths is-offset-one-fifth mt-6 p-2">
        <DynamicUserGuidePage />
      </div>
    </div>
  );
};

export default UserGuidePage;
