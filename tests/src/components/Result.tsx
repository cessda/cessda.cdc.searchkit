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

import '../../mocks/reacti18nMock';
import React from "react";
import { render, screen, } from "../../testutils";
import Result from "../../../src/components/Result";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Hit, HitAttributeHighlightResult } from 'instantsearch.js';
import { CMMStudy } from '../../../common/metadata';

const baseMockHit = {
  objectID: "1",
  titleStudy: 'Full Study Title',
  _index: "coordinate_en",
  abstract: "<P>Long Abstract.\nAipiscing elit ut aliquam purus sit amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non enim praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus. sneaky html</P>",
  creators: [
    { name: 'Jane Doe' },
    { name: 'University of Essex' },
    { name: 'John Smith', affiliation: 'University of Essex' }
  ],
  keywords: [
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "mass_culture",
      "term": "mass culture"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "youth_culture",
      "term": "youth culture"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "leisure_time_activities",
      "term": "leisure time activities"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "fashion",
      "term": "fashion"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "musicians",
      "term": "musicians"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "music",
      "term": "music"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "listening_to_music",
      "term": "listening to music"
    },
    {
      "vocab": "ELSST",
      "vocabUri": "https://elsst.cessda.eu/id",
      "id": "youth",
      "term": "youth"
    }
  ],
  dataAccess: 'Open',
  langAvailableIn: ['en', 'fi'],
  studyUrl: 'http://example.com',
  _highlightResult: {
    abstract: {
      matchLevel: "none",
      matchedWords: [],
      value: "Long Abstract.\nAipiscing elit ut aliquam purus sit amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non enim praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus."
    },
    titleStudy: {
      matchLevel: "none",
      matchedWords: [],
      value: "Full Study Title"
    }
  }
} as unknown as Hit<CMMStudy & Record<string, unknown>>;

it('renders result with title, creators, and abstract', () => {
  render(<Result hit={baseMockHit} />);

  // Title
  expect(screen.getByText(baseMockHit.titleStudy)).toBeInTheDocument();

  // Creators
  expect(screen.getByText('Jane Doe;')).toBeInTheDocument();
  expect(screen.getByText('University of Essex;')).toBeInTheDocument();
  expect(screen.getByText('John Smith (University of Essex)')).toBeInTheDocument();

  // Abstract
  expect(screen.getByText('Long Abstract. Aipiscing elit ut aliquam purus sit amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non enim praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed...')).toBeInTheDocument();
});

it('renders highlighted title', () => {
  // Modify the mockHit for this test
  const modifiedHit: Hit<CMMStudy & Record<string, unknown>> = {
    ...baseMockHit,
    _highlightResult: {
      abstract: {
        fullyHighlighted: false,
        matchLevel: "full",
        matchedWords: [
          "family"
        ],
        value: "and with whom they are in the afternoons, how much time they spend at home alone, and how often the __ais-highlight__family__/ais-highlight__"
      },
      titleStudy: {
        fullyHighlighted: false,
        matchLevel: "full",
        matchedWords: [
          "Family"
        ],
        value: "__ais-highlight__Family__/ais-highlight__ Barometer 2001: Children's Leisure Time"
      }
    },
  };

  render(<Result hit={modifiedHit} />);

  // Title
  expect(screen.getByText((modifiedHit?._highlightResult?.titleStudy as HitAttributeHighlightResult).value )).toBeInTheDocument();
});

it('renders language buttons', () => {
  render(<Result hit={baseMockHit} />);

  expect(screen.getByText('EN')).toBeInTheDocument();
  expect(screen.getByText('FI')).toBeInTheDocument();
});

it('renders external study link', () => {
  render(<Result hit={baseMockHit} />);

  const link = screen.getByTestId('study-url');
  expect(link).toHaveAttribute('href', 'http://example.com');
});

it('toggles abstract expansion on button click', async () => {
  render(<Result hit={baseMockHit} />);

  const expandAbstractButton = screen.getByTestId('expand-abstract');
  await userEvent.click(expandAbstractButton);

  // Expect abstract to be expanded
  expect(screen.getByText('readLess')).toBeInTheDocument();

  await userEvent.click(expandAbstractButton);

  // Expect abstract to be collapsed
  expect(screen.getByText('readMore')).toBeInTheDocument();
});

it('toggles abstract expansion on Enter or Space key', async () => {
  const modifiedHit: Hit<CMMStudy & Record<string, unknown>> = {
    ...baseMockHit,
    _highlightResult: {
      abstract: {
        fullyHighlighted: false,
        matchLevel: "full",
        matchedWords: [
          "family"
        ],
        value: "and with whom they are in the afternoons, how much time they spend at home alone, and how often the __ais-highlight__family__/ais-highlight__"
      },
      titleStudy: {
        fullyHighlighted: false,
        matchLevel: "full",
        matchedWords: [
          "Family"
        ],
        value: "__ais-highlight__Family__/ais-highlight__ Barometer 2001: Children's Leisure Time"
      }
    },
  };
  render(<Result hit={modifiedHit} />);

  const expandAbstractButton = screen.getByTestId('expand-abstract');
  expandAbstractButton.focus();
  await userEvent.keyboard('{Enter}');

  // Expect abstract to be expanded
  expect(screen.getByText('readLess')).toBeInTheDocument();

  await userEvent.keyboard('{ }');

  // Expect abstract to be collapsed
  expect(screen.getByText('readMore')).toBeInTheDocument();
});

it('should display "Open" when data access is Open', () => {
  render(<Result hit={baseMockHit}/>);

  expect(screen.getByText('Open')).toBeInTheDocument();
});

it('should display "Restricted" when data access is Restricted', () => {
  render(<Result hit={{ ...baseMockHit, dataAccess: 'Restricted' }} />);

  expect(screen.getByText('Restricted')).toBeInTheDocument();
});

it('should not display data access when it is Uncategorized', () => {
  render(<Result hit={{ ...baseMockHit, dataAccess: 'Uncategorized' }} />);

  expect(screen.queryByText('Open')).not.toBeInTheDocument();
  expect(screen.queryByText('Restricted')).not.toBeInTheDocument();
});

it('should not display data access when it is empty string', () => {
  render(<Result hit={{ ...baseMockHit, dataAccess: '' }} />);

  expect(screen.queryByText('Open')).not.toBeInTheDocument();
  expect(screen.queryByText('Restricted')).not.toBeInTheDocument();
});
