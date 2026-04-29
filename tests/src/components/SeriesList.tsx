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
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SeriesList from '../../../src/components/SeriesList';
import { Series } from '../../../common/metadata';
import { mockStudy } from '../../common/mockdata';
import '@testing-library/jest-dom';

// Helper function to render component with provided props
function setup(providedProps: Partial<{ seriesList: Series[] }> = {}) {
  const defaultProps = {
    seriesList: mockStudy.series,
  };

  const props = { ...defaultProps, ...providedProps };
  const lang = 'en';

  render(<SeriesList {...props} lang={lang} />);

  return { props, lang };
}


it('should render a list of SeriesDetail components', () => {
  setup();

  const seriesDetails = screen.getAllByTestId('series-detail');
  expect(seriesDetails).toHaveLength(2);
});

it('should render a "not available" message if the series list is empty', () => {
  setup({ seriesList: [] });

  expect(screen.getByText('language.notAvailable.field')).toBeInTheDocument();
});

it('should render names and descriptions correctly', () => {
  setup();

  const pElements = screen.getAllByText(/Series \d|Description/i);
  expect(pElements).toHaveLength(4);
  expect(pElements[0]).toHaveTextContent('Series 1');
  expect(pElements[1]).toHaveTextContent('Series 1 Description');
  expect(pElements[2]).toHaveTextContent('Series 2');
  expect(pElements[3]).toHaveTextContent('Series 2 Description');
});

it('should render names with URIs when available', () => {
  setup();

  const links = screen.getAllByRole('link');
  expect(links).toHaveLength(2);
  expect(links[0]).toHaveAttribute('href', 'http://example.com/1');
  expect(links[1]).toHaveAttribute('href', 'http://example.com/2');
});

it('should render with just description', () => {
  setup({
    seriesList: [
      { names: [], descriptions: ['No name or URI'], uris: [] },
    ],
  });

  expect(screen.getByText('No name or URI')).toBeInTheDocument();
});

it('should render remaining URIs when there are more URIs than names', () => {
  setup({
      seriesList: [
          { names: ['Series 1'], descriptions: ['Description'], uris: ['http://example.com/uri1', 'http://example.com/uri2'] },
      ],
  });

  const uriLinks = screen.getAllByRole('link');
  expect(uriLinks[1]).toHaveAttribute('href', 'http://example.com/uri2');
});

it('should toggle multiple descriptions correctly', () => {
  const description1 = 'a '.repeat(200);
  const shortDescription2 = 'b '.repeat(98) + 'b...';
  const longDescription2 = 'b '.repeat(500) + 'b';
  const description3 = 'c '.repeat(100) + 'c';

  setup({
    seriesList: [
      { names: ['Series 1'], descriptions: [description1, longDescription2, description3], uris: ['http://example.com/uri1'] },
    ],
  });

  // Check initial truncation
  const paragraphs = screen.getAllByText(/a|b|c/i);
  expect(paragraphs).toHaveLength(3);
  expect(paragraphs[1]).toHaveTextContent(shortDescription2);

  // Simulate clicking "Read more"
  const readMoreButton = screen.getByText('readMore')
  fireEvent.click(readMoreButton);

  // Check if descriptions expand
  const expandedParagraphs = screen.getAllByText(/a|b|c/i);
  expect(expandedParagraphs).toHaveLength(4);
  expect(expandedParagraphs[1]).toHaveTextContent(longDescription2);
  expect(expandedParagraphs[2]).toHaveTextContent(description3);
});
