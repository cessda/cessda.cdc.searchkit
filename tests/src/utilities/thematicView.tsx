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

import React from 'react';
import '../../mocks/reduxHooksMock';
import { mockDispatch } from '../../mocks/reduxHooksMock';
import { useLocation } from 'react-router';
import { renderHook, act, render } from '@testing-library/react';
import { ThematicViewInitialiser, useResetToThematicView } from '../../../src/utilities/thematicView';
import { thematicViews } from '../../../common/thematicViews';
import { BASE_INDEX, DEFAULT_HITS_PER_PAGE } from '../../../common/constants';

const mockNavigate = jest.fn();
const mockSetUiState = jest.fn();

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

jest.mock('react-instantsearch', () => ({
  useInstantSearch: () => ({
    setUiState: mockSetUiState,
    uiState: {},
  }),
}));

jest.mock('../../../src/reducers/thematicView', () => ({
  updateThematicView: (payload: { path: string; indexName: string }) => ({
    type: 'updateThematicView',
    payload,
  }),
}));

jest.mock('../../../src/reducers/search', () => ({
  triggerSearchFormReset: () => ({
    type: 'triggerSearchFormReset',
  }),
}));

describe('useResetToThematicView', () => {
  beforeEach(() => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/',
      search: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches updates and resets state for root collection', () => {
    const cdcView = thematicViews.find(v => v.key === 'cdc')!;

    const { result } = renderHook(() => useResetToThematicView());

    act(() => {
      result.current(cdcView);
    });

    // Redux updates
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'updateThematicView',
      payload: {
        path: '/',
        indexName: cdcView.defaultIndex,
      },
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'triggerSearchFormReset',
    });

    // InstantSearch updater function
    expect(mockSetUiState).toHaveBeenCalledTimes(1);
    const updater = mockSetUiState.mock.calls[0][0];
    expect(typeof updater).toBe('function');

    const nextState = updater({});

    expect(nextState[BASE_INDEX]).toEqual({
      query: undefined,
      page: 1,
      hitsPerPage: DEFAULT_HITS_PER_PAGE,
      refinementList: {},
      range: undefined,
      sortBy: undefined,
    });

    // Navigation
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('navigates to canonical URL for non-root collection', () => {
    const view = thematicViews.find(v => v.path !== '/')!;

    const { result } = renderHook(() => useResetToThematicView());

    act(() => {
      result.current(view);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'updateThematicView',
      payload: {
        path: view.path,
        indexName: view.defaultIndex,
      },
    });

    expect(mockSetUiState).toHaveBeenCalledTimes(1);
    const updater = mockSetUiState.mock.calls[0][0];
    const nextState = updater({});

    expect(nextState[BASE_INDEX]).toMatchObject({
      sortBy: view.defaultIndex,
      page: 1,
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `${view.path}/?sortBy=${view.defaultIndex}`,
      { replace: false }
    );
  });

  it('initialises Redux but does not navigate or touch InstantSearch on non-search routes', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/about',
      search: '',
    });

    render(<ThematicViewInitialiser />);

    // Redux initialisation happens
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'updateThematicView',
      payload: {
        path: '/',
        indexName: expect.any(String),
      },
    });

    // No navigation
    expect(mockNavigate).not.toHaveBeenCalled();

    // No InstantSearch initialisation
    expect(mockSetUiState).not.toHaveBeenCalled();
  });
});
