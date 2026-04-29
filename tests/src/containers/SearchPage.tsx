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
import { mockDispatch } from '../../mocks/reduxHooksMock';
import React from "react";
import { render, screen } from "../../testutils";
import userEvent from '@testing-library/user-event';
import { useSearchParams } from "react-router";
import SearchPage from "../../../src/containers/SearchPage";
import { thematicViews, EsIndex } from "../../../common/thematicViews";
import { useAppSelector } from "../../../src/hooks";
import '@testing-library/jest-dom';
import reducer, { updateThematicView } from "../../../src/reducers/thematicView";
import { useCurrentRefinements } from "react-instantsearch";


const initialView = thematicViews[0];
const initialIndex = initialView.esIndexes.find((i) => i.indexName === initialView.defaultIndex) as EsIndex;

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
    expect(document.querySelector('.ais-HitsPerPage-select')).toBeInTheDocument();
    expect(document.querySelector('.ais-SortBy-select')).toBeInTheDocument();
    expect(document.querySelector('.ais-RangeInput')).toBeInTheDocument();
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

  it('should return updated Thematic View state', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    const newView = thematicViews.find(tv => tv.path === "/coordinate")!;

    const nextState = reducer(
      initialState,
      updateThematicView({
        path: newView.path,
        indexName: newView.defaultIndex,
      })
    );

    const expectedIndex =
      newView.esIndexes.find(i => i.indexName === newView.defaultIndex)!;

    expect(nextState).toEqual({
      currentThematicView: newView,
      currentIndex: expectedIndex,
      list: thematicViews,
    });
  });

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
