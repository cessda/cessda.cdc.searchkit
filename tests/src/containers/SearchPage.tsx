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
import { render, screen } from "../../testutils";
import userEvent from '@testing-library/user-event';
import { useSearchParams } from "react-router";
import SearchPage from "../../../src/containers/SearchPage";
import { ThematicView, thematicViews, EsIndex } from "../../../common/thematicViews";
import { useAppDispatch, useAppSelector } from "../../../src/hooks";
import '@testing-library/jest-dom';
import { SortByItem } from 'instantsearch.js/es/connectors/sort-by/connectSortBy';
import reducer from "../../../src/reducers/thematicView";
import { useCurrentRefinements } from "react-instantsearch";

// Mock the react-instantsearch components
jest.mock("react-instantsearch", () => ({
  Hits: jest.fn(() => <div>Mocked Hits</div>),
  RefinementList: jest.fn(() => <div>Mocked RefinementList</div>),
  ClearRefinements: jest.fn(() => <button>Mocked Clear Refinements</button>),
  CurrentRefinements: jest.fn(() => <button>Mocked Current Refinements</button>),
  Stats: jest.fn(() => <div>Mocked Stats</div>),
  HitsPerPage: jest.fn(() => <div>Mocked HitsPerPage</div>),
  SortBy: jest.fn(({ items, ...props }) => (
    <select onChange={props.onChange}>
      {items.map((item: SortByItem) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )),
  Pagination: jest.fn(() => <div>Mocked Pagination</div>),
  RangeInput: jest.fn(() => <div>Mocked RangeInput</div>),

  useRefinementList: jest.fn(() => ({
    refine: jest.fn(),
    items: [],
    isShowingMore: false,
    toggleShowMore: jest.fn(),
    canToggleShowMore: false,
  })),
  useCurrentRefinements: jest.fn(() => ({
    items: [],
  })),
  useClearRefinements: jest.fn(() => ({})),
  usePagination: jest.fn(() => ({})),
  useSearchBox: jest.fn(() => ({})),
  useInstantSearch: jest.fn(() => ({})),
}));

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
const initialIndex = initialView.esIndexes.find((i) => i.indexName === initialView.defaultIndex) as EsIndex;
//const newView = thematicViews.find((tv) => tv.path === "/coordinate") as ThematicView;
//const newIndex = newView.esIndexes.find((i) => i.indexName === newView.defaultIndex ) as EsIndex;


describe("SearchPage", () => {
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

    const mockSetSearchParams = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue([
      {
        get: jest.fn((key) => {
          if (key === 'sortBy') {
            return 'coordinate_en_title_asc';
          }
          return null;
        }),
      },
      mockSetSearchParams,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render SearchPage correctly", async () => {
    render(<SearchPage />);

    // Check that the mocked components are rendered
    expect(screen.getByText("Mocked Hits")).toBeInTheDocument();
    expect(screen.getByText("Mocked Clear Refinements")).toBeInTheDocument();
    expect(screen.getByText("Mocked Stats")).toBeInTheDocument();
    expect(screen.getByText("Mocked HitsPerPage")).toBeInTheDocument();
    expect(screen.getByText("Mocked RangeInput")).toBeInTheDocument();
    const paginations = screen.getAllByText(/Mocked Pagination/i);
    // Check that the correct number of Pagination is rendered
    expect(paginations).toHaveLength(2);
    const refinementLists = screen.getAllByTestId('custom-refinement-list');
    // Check that the correct number of RefinementList is rendered
    expect(refinementLists).toHaveLength(6);
  });

  it('should return the initial Thematic View state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(
      {
        currentIndex: initialIndex,
        list: thematicViews,
        currentThematicView: initialView,
      }
    )
  });
  /*
  it('should return updated Thematic View state', () => {

    expect(reducer(undefined, { type: 'unknown', path: "/coordinate", EsIndex: newIndex })).toEqual(
        {
            currentIndex: newIndex,
            list: thematicViews,
            currentThematicView: newView,
             }
      )
  });
  */
  it("should handle mobile filter toggle", async () => {
    render(<SearchPage />);

    const filterButton = screen.getByText("showFilters");
    await userEvent.click(filterButton);

    expect(mockDispatch).toHaveBeenCalledWith({ "payload": false, "type": "search/toggleMobileFilters" });
  });

  it("should handle filter summary toggle with enter", async () => {
    const mockRefinements = [{ attribute: 'keywords', refinements: [{ label: 'education' }] }];
    (useCurrentRefinements as jest.Mock).mockReturnValue({ items: mockRefinements });

    render(<SearchPage />);

    const toggleSummaryButton = screen.getByTestId('filter-summary-button');
    toggleSummaryButton.focus();
    await userEvent.keyboard('{Enter}');

    expect(mockDispatch).toHaveBeenCalledWith({ "payload": false, "type": "search/toggleSummary" });
  });

  it("should open and close filter summary modal", async () => {
    // Mock refinements so the summary button is enabled
    (useAppSelector as jest.Mock).mockImplementation((callback) =>
      callback({
        thematicView: {
          currentThematicView: initialView,
          currentIndex: initialIndex
        },
        search: {
          showFilterSummary: true,
          showMobileFilters: false
        },
      })
    );

    // Mock refinements to simulate active filters
    const mockRefinements = [{ attribute: 'keywords', refinements: [{ label: 'education' }] }];
    (useCurrentRefinements as jest.Mock).mockReturnValue({ items: mockRefinements });

    const { rerender } = render(<SearchPage />);

    // Modal should be visible
    expect(screen.getByTestId('filter-summary')).toBeInTheDocument();
    expect(screen.getByText("Mocked Current Refinements")).toBeInTheDocument();

    // Simulate closing the modal
    const closeFilterSummaryButton = screen.getByTestId("close-filter-summary");
    await userEvent.click(closeFilterSummaryButton);

    // Simulate state update after dispatch
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

    rerender(<SearchPage />);

    // Modal should be gone
    expect(screen.queryByTestId('filter-summary')).toBeNull();
    expect(screen.queryByText("Mocked Current Refinements")).toBeNull();
  });
});
