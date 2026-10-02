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
import React from 'react';
import { render } from '../../testutils';
import AutomaticSort from '../../../src/components/AutomaticSort';
import {
  useCurrentRefinements,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch';
import { useAppSelector } from '../../../src/hooks';

jest.mock('react-instantsearch', () => ({
  useCurrentRefinements: jest.fn(),
  useInstantSearch: jest.fn(),
  useSearchBox: jest.fn(),
}));

const mockSetUiState = jest.fn();

describe('AutomaticSort', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAppSelector as jest.Mock).mockImplementation(selector =>
      selector({
        thematicView: {
          currentThematicView: {
            defaultIndex: 'coordinate_en',
          },
        },
        search: {
          isSortManuallySelected: false,
        },
      })
    );

    (useInstantSearch as jest.Mock).mockReturnValue({
      uiState: {
        cmmstudy_en: {
          sortBy: 'coordinate_en',
        },
      },
      setUiState: mockSetUiState,
    });

    (useSearchBox as jest.Mock).mockReturnValue({
      query: '',
    });

    (useCurrentRefinements as jest.Mock).mockReturnValue({
      items: [],
    });
  });

  it('switches to relevance sorting when a search query exists', () => {
    (useSearchBox as jest.Mock).mockReturnValue({
      query: 'climate',
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).toHaveBeenCalledTimes(1);

    const updater = mockSetUiState.mock.calls[0][0];

    const newState = updater({
      cmmstudy_en: {
        sortBy: 'coordinate_en',
        page: 3,
      },
    });

    expect(newState.cmmstudy_en.sortBy).toBe('coordinate_en_relevance');

    expect(newState.cmmstudy_en.page).toBe(1);
  });

  it('uses relevance sorting for keyword refinements', () => {
    (useCurrentRefinements as jest.Mock).mockReturnValue({
      items: [
        {
          attribute: 'keywords',
        },
      ],
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).toHaveBeenCalledTimes(1);
  });

  it('uses relevance sorting for topic refinements', () => {
    (useCurrentRefinements as jest.Mock).mockReturnValue({
      items: [
        {
          attribute: 'classifications',
        },
      ],
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).toHaveBeenCalledTimes(1);
  });

  it('does not switch to relevance for country refinements', () => {
    (useCurrentRefinements as jest.Mock).mockReturnValue({
      items: [
        {
          attribute: 'country',
        },
      ],
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).not.toHaveBeenCalled();
  });

  it('does not override manually selected sorting', () => {
    (useAppSelector as jest.Mock).mockImplementation(selector =>
      selector({
        thematicView: {
          currentThematicView: {
            defaultIndex: 'coordinate_en',
          },
        },
        search: {
          isSortManuallySelected: true,
        },
      })
    );

    (useSearchBox as jest.Mock).mockReturnValue({
      query: 'climate',
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).not.toHaveBeenCalled();
  });

  it('does nothing when the desired sort is already active', () => {
    (useSearchBox as jest.Mock).mockReturnValue({
      query: 'climate',
    });

    (useInstantSearch as jest.Mock).mockReturnValue({
      uiState: {
        cmmstudy_en: {
          sortBy: 'coordinate_en_relevance',
        },
      },
      setUiState: mockSetUiState,
    });

    render(<AutomaticSort />);

    expect(mockSetUiState).not.toHaveBeenCalled();
  });
});
