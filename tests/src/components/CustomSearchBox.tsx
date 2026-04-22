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
import '../../mocks/routerMock';
import '../../mocks/reduxHooksMock';
import React from 'react';
import { render, screen, waitFor } from '../../testutils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CustomSearchBox from '../../../src/components/CustomSearchBox';
import { useSearchBox, useInstantSearch } from 'react-instantsearch';
import { useSearchParams } from 'react-router';
import { useAppSelector } from '../../../src/hooks';

jest.mock('react-instantsearch', () => ({
  useSearchBox: jest.fn(),
  useInstantSearch: jest.fn(),
}));

const mockRefine = jest.fn();
const mockSetQueryError = jest.fn();
const mockSetSearchParams = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  jest.mocked(useSearchBox).mockReturnValue({
    query: '',
    refine: mockRefine,
    clear: jest.fn(),
    isSearchStalled: false,
  });

  (useInstantSearch as jest.Mock).mockReturnValue({
    status: 'idle',
  });

  (useSearchParams as jest.Mock).mockReturnValue([
    new URLSearchParams(),
    mockSetSearchParams,
  ]);

  (useAppSelector as jest.Mock).mockImplementation((selector) =>
    selector({
      thematicView: {
        currentThematicView: {
          path: '/coordinate',
          longTitle: 'COORDINATE Portal',
        },
      },
      search: {
        shouldResetSearchForm: false,
      },
    })
  );
});

describe('CustomSearchBox', () => {
  it('renders search input and buttons', () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search\.label$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search\.reset$/ })).toBeInTheDocument();
  });

  it('updates input value and clears query error on change', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'climate');

    expect(input).toHaveValue('climate');
    expect(mockSetQueryError).toHaveBeenLastCalledWith(null);
  });

  it('submits a valid query and calls refine', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    const submitButton = screen.getByRole('button', { name: /^search\.label$/ })

    await userEvent.type(input, 'climate');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefine).toHaveBeenCalledWith('climate');
    });

    expect(mockSetQueryError).toHaveBeenLastCalledWith(null);
  });

  it('sets an error for invalid wildcard-only query', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    const submitButton = screen.getByRole('button', { name: /^search\.label$/ })

    await userEvent.type(input, '***');
    await userEvent.click(submitButton);

    expect(mockRefine).not.toHaveBeenCalled();
    expect(mockSetQueryError).toHaveBeenCalledWith(
      'Search query cannot consist only of wildcards.'
    );
  });

  it('submits search when Enter key is pressed', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');

    await userEvent.type(input, 'energy{Enter}');

    await waitFor(() => {
      expect(mockRefine).toHaveBeenCalledWith('energy');
    });
  });

  it('resets query when reset button is clicked', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    const resetButton = screen.getByRole('button', { name: /^search\.reset$/ });

    await userEvent.type(input, 'climate');
    expect(input).toHaveValue('climate');

    await userEvent.click(resetButton);

    expect(input).toHaveValue('');
    expect(mockRefine).toHaveBeenCalledWith('');
    expect(mockSetQueryError).toHaveBeenLastCalledWith(null);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('resets input when shouldResetSearchForm is true', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        thematicView: {
          currentThematicView: {
            path: '/coordinate',
            longTitle: 'COORDINATE Portal',
          },
        },
        search: {
          shouldResetSearchForm: true,
        },
      })
    );

    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('');
  });

  it('sets error for unmatched parentheses', async () => {
    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const input = screen.getByRole('searchbox');
    const submitButton = screen.getByRole('button', { name: /^search\.label$/ });

    await userEvent.type(input, '(test');
    await userEvent.click(submitButton);

    expect(mockRefine).not.toHaveBeenCalled();
    expect(mockSetQueryError).toHaveBeenCalledWith(
      'Unmatched opening parenthesis.'
    );
  });

  it('disables reset and shows loading state when search is stalled', () => {
    (useInstantSearch as jest.Mock).mockReturnValue({
      status: 'stalled',
    });

    render(<CustomSearchBox setQueryError={mockSetQueryError} />);

    const submitButton = screen.getByRole('button', { name: /^search\.label$/ });
    const resetButton = screen.getByRole('button', { name: /^search\.reset$/ });

    expect(submitButton).toHaveClass('is-loading');
    expect(resetButton).toBeDisabled();
  });
});
