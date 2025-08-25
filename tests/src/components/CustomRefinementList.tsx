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

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import CustomRefinementList from '../../../src/components/CustomRefinementList';
import { useRefinementList, useCurrentRefinements } from 'react-instantsearch';
import { useAppSelector } from '../../../src/hooks';
import userEvent from '@testing-library/user-event';

jest.mock("../../../src/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

let debouncedFn: jest.MockedFunction<(value: string) => void>;

jest.mock('lodash', () => {
  const original = jest.requireActual('lodash');
  return {
    ...original,
    debounce: (fn: (value: string) => void) => {
      debouncedFn = fn as jest.MockedFunction<(value: string) => void>;
      return fn;
    },
  };
});

jest.mock('react-instantsearch', () => ({
  useRefinementList: jest.fn(),
  useCurrentRefinements: jest.fn(),
}));

const mockRefine = jest.fn();
const mockToggleShowMore = jest.fn();
const mockSearchForItems = jest.fn();

const baseItems = [
  { label: 'option a', value: 'option a', count: 10, isRefined: false },
  { label: 'option b', value: 'option b', count: 5, isRefined: true },
];

beforeEach(() => {
  jest.clearAllMocks();

  (useRefinementList as jest.Mock).mockReturnValue({
    refine: mockRefine,
    items: baseItems,
    isShowingMore: false,
    toggleShowMore: mockToggleShowMore,
    canToggleShowMore: true,
    searchForItems: mockSearchForItems,
  });

  (useCurrentRefinements as jest.Mock).mockReturnValue({
    items: [
      {
        attribute: 'category',
        refinements: [{ label: 'option b', value: 'option b' }],
      },
    ],
  });

  (useAppSelector as jest.Mock).mockReturnValue({ indexName: 'test_index' });
});

describe('CustomRefinementList', () => {
  it('renders with default props', () => {
    render(<CustomRefinementList attribute="category" />);
    expect(screen.getByTestId('custom-refinement-list')).toBeInTheDocument();
    expect(screen.getByText('option a')).toBeInTheDocument();
    expect(screen.getByText('option b')).toBeInTheDocument();
  });

  it('renders search box when searchable is true', () => {
    render(<CustomRefinementList attribute="category" searchable />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('calls refine when checkbox is clicked', async () => {
    render(<CustomRefinementList attribute="category" />);
    const checkboxes = screen.getAllByRole('checkbox');
    const optionACheckbox = checkboxes[0];

    expect(optionACheckbox).not.toBeChecked();
    await userEvent.click(optionACheckbox);
    expect(mockRefine).toHaveBeenCalledWith('option a');
  });

  it('clears all refinements when clear button is clicked', async () => {
    render(<CustomRefinementList attribute="category" />);
    const clearButton = screen.getByText(/clear/i);
    await userEvent.click(clearButton);
    expect(mockRefine).toHaveBeenCalledWith('option b');
  });

  it('toggles show more when button is clicked', async () => {
    render(<CustomRefinementList attribute="category" showMore />);
    const button = screen.getByRole('button', { name: /show more/i });
    await userEvent.click(button);
    expect(mockToggleShowMore).toHaveBeenCalled();
  });

  it('updates query while changing input into lowercase and shows reset button', async () => {
    render(<CustomRefinementList attribute="category" searchable />);
    const input = screen.getByRole('searchbox');

    await act(async () => {
      await userEvent.type(input, 'TEST');
    });

    expect(input).toHaveValue('test');
    await waitFor(() => {
      expect(mockSearchForItems).toHaveBeenCalledWith('t');
      expect(mockSearchForItems).toHaveBeenCalledWith('te');
      expect(mockSearchForItems).toHaveBeenCalledWith('tes');
      expect(mockSearchForItems).toHaveBeenCalledWith('test');
    });

    const resetButton = screen.getByTitle(/clear/i);
    await act(async () => {
      await userEvent.click(resetButton);
    });

    expect(input).toHaveValue('');
    await waitFor(() => {
      expect(mockSearchForItems).toHaveBeenCalledWith('');
    });
  });

  it('refines and resets query when checkbox is clicked during search', async () => {
    render(<CustomRefinementList attribute="category" searchable />);
    const input = screen.getByRole('searchbox');

    await act(async () => {
      await userEvent.type(input, 'Alpha');
    });

    // Manually trigger the debounced search
    act(() => {
      debouncedFn('alpha');
    });

    await waitFor(() => {
      expect(mockSearchForItems).toHaveBeenCalledWith('alpha');
    });

    const checkbox = screen.getAllByRole('checkbox')[0];
    await act(async () => {
      await userEvent.click(checkbox);
    });

    expect(mockRefine).toHaveBeenCalled();

    // Manually trigger the debounced reset
    act(() => {
      debouncedFn('');
    });

    await waitFor(() => {
      expect(mockSearchForItems).toHaveBeenCalledWith('');
    });
  });

  it('clears all refinements and resets query', async () => {
    render(<CustomRefinementList attribute="category" searchable />);
    const input = screen.getByRole('searchbox');

    await act(async () => {
      await userEvent.type(input, 'test');
    });

    const clearButton = screen.getByText(/clear/i);
    await act(async () => {
      await userEvent.click(clearButton);
    });

    expect(mockRefine).toHaveBeenCalledWith('option b');
    expect(mockSearchForItems).toHaveBeenCalledWith('');
  });

  it('shows selected refinements in the list when disableTags is true', () => {
    render(<CustomRefinementList attribute="category" disableTags />);

    // Both options should be visible even though Option B is selected
    expect(screen.getByText('option a')).toBeInTheDocument();
    expect(screen.getByText('option b')).toBeInTheDocument();

    // The selected tag section should not be rendered
    expect(screen.queryByText(/clear/i)).not.toBeInTheDocument();
  });

  it('refines when Enter is pressed on a focused checkbox', async () => {
    render(<CustomRefinementList attribute="category" />);
    const checkbox = screen.getByRole('checkbox', { name: /option a/i });

    checkbox.focus();
    expect(checkbox).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('{Enter}');
    });

    expect(mockRefine).toHaveBeenCalledWith('option a');
  });
});
