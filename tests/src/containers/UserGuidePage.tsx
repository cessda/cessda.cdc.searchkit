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

import '../../mocks/reacti18nMock';
import React from "react";
import { render } from "../../testutils";
import UserGuidePage from "../../../src/containers/UserGuidePage";
import { ThematicView, thematicViews, EsIndex } from "../../../common/thematicViews";
import { useAppDispatch, useAppSelector } from "../../../src/hooks";
import '@testing-library/jest-dom';


// Mock react-router module
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useSearchParams: jest.fn(),
  useLocation: () => ({
    pathname: "/",
    key: "mockKey",
  }),
}));

// Mock the redux hooks
jest.mock("../../../src/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

const mockDispatch = jest.fn();
const initialView = thematicViews.find((tv) => tv.path === "/") as ThematicView;
const initialIndex =  initialView.esIndexes.find((i) => i.indexName === initialView.defaultIndex ) as EsIndex;




describe("User Guide Page", () => {
  beforeEach(() => {
    // Mock the necessary Redux state
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
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);


  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render User Guide Page correctly", async () => {
    render(<UserGuidePage />);

  });


});
