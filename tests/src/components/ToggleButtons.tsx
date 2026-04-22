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
import '../../mocks/reduxHooksMock';
import { mockDispatch } from '../../mocks/reduxHooksMock';
import React from 'react';
import { render, screen } from '../../testutils';
import ToggleButtons from '../../../src/components/ToggleButtons';
import { useAppSelector } from '../../../src/hooks';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('ToggleButtons', () => {
  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation(selector =>
      selector({
        search: {
          showAbstract: false,
          showKeywords: false,
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders toggle buttons', () => {
    render(<ToggleButtons />);

    expect(screen.getByLabelText('showAbstract')).toBeInTheDocument();
    expect(screen.getByLabelText('showKeywords')).toBeInTheDocument();
  });

  it('dispatches actions when toggles are clicked', async () => {
    render(<ToggleButtons />);

    // Simulate user toggling abstract and keywords
    await userEvent.click(screen.getByLabelText('showAbstract'));
    await userEvent.click(screen.getByLabelText('showKeywords'));

    // Check that the dispatch function was called with a specific action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'search/toggleAbstract',
      payload: false,
    });

    // Check that the dispatch function was called with a specific action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'search/toggleKeywords',
      payload: false,
    });
  });
});
