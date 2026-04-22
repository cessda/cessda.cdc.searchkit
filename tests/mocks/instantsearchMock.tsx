import React from 'react';
import { SortByItem } from 'instantsearch.js/es/connectors/sort-by/connectSortBy';

jest.mock('react-instantsearch', () => ({
  Hits: () => <div>Mocked Hits</div>,
  RefinementList: () => <div>Mocked RefinementList</div>,
  ClearRefinements: () => <button>Mocked Clear Refinements</button>,
  CurrentRefinements: () => <button>Mocked Current Refinements</button>,
  Stats: () => <div>Mocked Stats</div>,
  HitsPerPage: () => (
    <div className="ais-HitsPerPage">
      <select className="ais-HitsPerPage-select">
        <option value="10">Show 10</option>
      </select>
    </div>
  ),
  Pagination: () => <div>Mocked Pagination</div>,
  RangeInput: () => (
    <div className="ais-RangeInput">
      <form>
        <label className="ais-RangeInput-label">
          <input type="number" />
        </label>
        <label className="ais-RangeInput-label">
          <input type="number" />
        </label>
      </form>
    </div>
  ),
  SortBy: ({ items, onChange }: { items: SortByItem[]; onChange: any }) => (
    <select onChange={onChange}>
      {items.map(item => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
  useRefinementList: () => ({
    refine: jest.fn(),
    items: [],
    isShowingMore: false,
    toggleShowMore: jest.fn(),
    canToggleShowMore: false,
  }),
  useCurrentRefinements: jest.fn(() => ({ items: [] })),
  useClearRefinements: () => ({}),
  usePagination: () => ({}),
  useSearchBox: () => ({}),
  useInstantSearch: jest.fn(() => ({})),
}));
