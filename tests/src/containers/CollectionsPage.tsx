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

import '../../mocks/reacti18nMock';
import '../../mocks/instantsearchMock';
import '../../mocks/routerMock';
import '../../mocks/reduxHooksMock';
import React from "react";
import { render } from "../../testutils";
import CollectionsPage from "../../../src/containers/CollectionsPage";
import { ThematicView, thematicViews, EsIndex } from "../../../common/thematicViews";
import { useAppSelector } from "../../../src/hooks";
import '@testing-library/jest-dom';


jest.mock('../../../src/img/icons/iconMap', () => ({
  iconMap: new Proxy({}, {
    get: () => 'test-icon.svg',
  }),
}));

const initialView = thematicViews.find((tv) => tv.path === "/") as ThematicView;
const initialIndex = initialView.esIndexes.find((i) => i.indexName === initialView.defaultIndex) as EsIndex;

describe("Collections Page", () => {
  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((callback) =>
      callback({
        thematicView: {
          currentThematicView: initialView,
          currentIndex: initialIndex
        },
        search: {
          showFilterSummary: false,
          showMobileFilters: false
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render Collections Page correctly", async () => {
    render(<CollectionsPage />);
  });
});
