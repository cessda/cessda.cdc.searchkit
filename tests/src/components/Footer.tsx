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
import React from 'react';
import Footer from '../../../src/components/Footer';
import { render } from '../../testutils';
import { thematicViews, ThematicView } from '../../../common/thematicViews';
import { useAppSelector } from '../../../src/hooks';


function renderFooterFor(view: typeof thematicViews[number]) {
  (useAppSelector as jest.Mock).mockImplementation(selector =>
    selector({
      thematicView: {
        currentThematicView: {
          key: view.key,
          path: view.path,
        },
      },
    })
  );

  return render(<Footer />);
}

describe('Footer (dynamic selection)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  thematicViews.forEach((view: ThematicView) => {
    it(`renders footer for thematic view "${view.key}"`, () => {
      const { getByTestId } = renderFooterFor(view);
      expect(getByTestId('footer')).toBeInTheDocument();
    });
  });
});

describe('Footer (CDC)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders CESSDA JSON-LD metadata', () => {
    const cdcView = thematicViews.find((v: { key: string; }) => v.key === 'cdc');
    if (!cdcView) {
      throw new Error('CDC thematic view not found');
    }

    const { getByTestId } = renderFooterFor(cdcView);

    const script = getByTestId('cessdaJson');

    expect(script).toBeInTheDocument();
    expect(script.getAttribute('type')).toBe('application/ld+json');

    const json = JSON.parse(script.textContent as string);

    expect(json).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CESSDA ERIC',
      url: 'https://www.cessda.eu',
      sameAs: [
        'https://twitter.com/CESSDA_Data',
        'https://www.linkedin.com/company/9392869',
        'https://www.youtube.com/channel/UCqbZKb1Enh-WcFpg6t86wsA',
      ],
    });
  });
});
