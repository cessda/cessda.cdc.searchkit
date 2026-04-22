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

import '../../mocks/reduxHooksMock';
import '../../mocks/routerMock';
import React from 'react';
import { render, screen } from '../../testutils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IndexSwitcher from '../../../src/components/IndexSwitcher';
import { useInstantSearch } from 'react-instantsearch';
import { useLocation } from 'react-router';
import { useAppSelector } from '../../../src/hooks';
import { mockDispatch } from '../../mocks/reduxHooksMock';
import { updateThematicView } from '../../../src/reducers/thematicView';
import { thematicViews } from '../../../common/thematicViews';
import { BASE_INDEX } from '../../../common/constants';


jest.mock('react-select', () => ({
  __esModule: true,
  default: jest.fn(({ options, value, onChange }) => (
    <select
      data-testid="index-switcher"
      value={value?.value.indexName}
      onChange={(e) => {
        const opt = options.find(
          (o: any) => o.value.indexName === e.target.value
        );
        onChange(opt);
      }}
    >
      {options.map((o: any) => (
        <option
          key={o.value.indexName}
          value={o.value.indexName}
        >
          {o.label}
        </option>
      ))}
    </select>
  )),
}));

jest.mock('react-instantsearch', () => ({
  useInstantSearch: jest.fn(),
}));

describe('IndexSwitcher', () => {
  const view = thematicViews[0];
  const baseIndex = view.esIndexes.find(
    (i) => i.indexName === view.defaultIndex
  )!;
  const secondaryIndex = view.esIndexes.find(
    (i) => i.indexName !== view.defaultIndex
  )!;

  beforeEach(() => {
    jest.clearAllMocks();

    (useInstantSearch as jest.Mock).mockReturnValue({
      uiState: {},
      setUiState: jest.fn(),
    });

    (useLocation as jest.Mock).mockReturnValue({
      pathname: view.path,
      search: '',
    });

    (useAppSelector as jest.Mock).mockImplementation((cb) =>
      cb({
        thematicView: {
          currentThematicView: view,
          currentIndex: baseIndex,
        },
      })
    );
  });

  it('renders current base language as selected option', () => {
    render(<IndexSwitcher />);

    const select = screen.getByTestId('index-switcher') as HTMLSelectElement;
    expect(select.value).toBe(BASE_INDEX);
  });

  it('changes language and dispatches updateThematicView', async () => {
    render(<IndexSwitcher />);

    const select = screen.getByTestId('index-switcher');
    await userEvent.selectOptions(select, secondaryIndex.indexName);

    expect(mockDispatch).toHaveBeenCalledWith(
      updateThematicView({
        path: view.path,
        indexName: secondaryIndex.indexName,
      })
    );
  });

  it('sets InstantSearch sortBy when non-base language is selected', async () => {
    const setUiState = jest.fn();

    (useInstantSearch as jest.Mock).mockReturnValue({
      uiState: {},
      setUiState,
    });

    render(<IndexSwitcher />);

    const select = screen.getByTestId('index-switcher');
    await userEvent.selectOptions(select, secondaryIndex.indexName);

    expect(setUiState).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });
});
