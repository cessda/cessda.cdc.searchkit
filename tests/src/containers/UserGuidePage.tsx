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
import '../../mocks/routerMock'
import '../../mocks/reduxHooksMock';
import React from 'react';
import { render } from '../../testutils';
import UserGuidePage from '../../../src/containers/UserGuidePage';
import { thematicViews, EsIndex } from '../../../common/thematicViews';
import '@testing-library/jest-dom';
import { useAppSelector } from '../../../src/hooks';


function renderUserGuideFor(view: typeof thematicViews[number]) {
  const index = view.esIndexes.find(
    i => i.indexName === view.defaultIndex
  ) as EsIndex;

  (useAppSelector as jest.Mock).mockImplementation(selector =>
    selector({
      thematicView: {
        currentThematicView: view,
        currentIndex: index,
      },
      search: {
        showFilterSummary: false,
        showMobileFilters: false,
      },
    })
  );

  return render(<UserGuidePage />);
}

describe('UserGuidePage (dynamic selection)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  thematicViews.forEach(view => {
    it(`renders user guide page for "${view.key}"`, () => {
      const { container } = renderUserGuideFor(view);

      expect(container.querySelector('h1')).toBeInTheDocument();
    });
  });
});

describe('UserGuidePage (CDC)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders CDC user guide content', () => {
    const cdcView = thematicViews.find(v => v.key === 'cdc');
    if (!cdcView) {
      throw new Error('CDC thematic view not found');
    }

    const { getByText } = renderUserGuideFor(cdcView);

    expect(
      getByText('User Guide - CESSDA Data Catalogue')
    ).toBeInTheDocument();

    expect(
      getByText('Searching')
    ).toBeInTheDocument();

    expect(
      getByText('Filtering')
    ).toBeInTheDocument();

    expect(
      getByText('Study details')
    ).toBeInTheDocument();
  });
});
