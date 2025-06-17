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
import Keywords, { Props } from '../../../src/components/Keywords';
import { TermURIResult, TermVocabAttributes } from '../../../common/metadata';
import { getELSSTTerm } from '../../../src/utilities/elsst';
import { act, render } from '../../testutils';

const promise = Promise.resolve({});

// Mock out the module that sends requests to the server
jest.mock('../../../src/utilities/elsst.ts', () => {
  return {
    __esModule: true,
    getELSSTTerm: jest.fn(() => promise)
  }
});

const initialProps: Props = {
  keywords: [],
  lang: "en",
  keywordLimit: 12,
  currentIndex: 'cmmstudy_en'
}

// Mock props and shallow render component for test.
function setup(providedProps: Partial<Props> = {}) {
  const props: Props = {
    ...initialProps,
    ...providedProps
  };
  const renderResult = render(<Keywords {...props} />);
  return {
    props,
    renderResult: renderResult
  };
}

function getKeyword(term: string): TermVocabAttributes {
  return {
    term: term,
    vocab: "",
    vocabUri: "",
    id: ""
  }
}

describe('Keywords component', () => {
  it('should render', () => {
    const { renderResult: renderResult } = setup();
    const tagContainer = renderResult.getByTestId("tags");
    expect(tagContainer).toBeInTheDocument();
  });

  it('should render keywords', () => {
    const keywords = ["1", "2", "3", "4"];

    const { renderResult: renderResult, props } = setup({
      keywords: keywords.map(t => getKeyword(t))
    });

    // Find all tag elements
    const tagElements = renderResult.getAllByTestId("tag");

    // There should be 4 keywords
    expect(tagElements).toHaveLength(4);

    // When rendering the component should have requested ELSST terms for the keywords
    expect(getELSSTTerm).toHaveBeenCalledWith(keywords, props.lang, expect.anything());
  });

  it('should link ELSST terms and limit fetching according to given keyword limit when expanding is disabled', async () => {
    const linkELSST = "https://elsst.cessda.eu/test/";

    // Mock implementation of getELSSTTerm()
    (getELSSTTerm as jest.MockedFn<typeof getELSSTTerm>).mockImplementation((labels) => {
      const destObject: TermURIResult = {};

      // Provide an ELSST link for each term, except when l is 3 to test term not having a link
      labels.forEach(l => {
        if (l !== "3") {
          destObject[l] = `${linkELSST}${l}`;
        }
      });

      return Promise.resolve(destObject);
    });

    const keywords = ["1", "2", "3", "4", "5", "6", "7"];

    const { renderResult: renderResult, props } = setup({
      keywords: keywords.map(t => getKeyword(t)),
      keywordLimit: 4,
      isExpandDisabled: true
    });

    // When rendering the component should have requested ELSST terms for the keywords
    // It should also only request term for the first 4 keywords because of keyword limit and disabled expanding
    expect(getELSSTTerm).toHaveBeenCalledWith(["1", "2", "3", "4"], props.lang, expect.anything());

    // The terms with ELSST link provided should link to ELSST
    const tagsELSSTFound = (await renderResult.findAllByTestId("elsst-link")).map((linkELSSTElement) => {
      // Find link to ELSST by it opening in a new tab/window
      expect(linkELSSTElement).toBeInTheDocument();
      return linkELSSTElement.getAttribute("href")?.includes(linkELSST);
    });
    // Limit is 4, expect 3 elements to be found - all with ELSST links
    expect(tagsELSSTFound).toEqual([true, true, true]);
  });

  it('should toggle between showing limited number of keywords and showing all keywords', () => {
    const keywords = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

    const { renderResult: renderResult } = setup({
      keywords: keywords.map(t => getKeyword(t))
    });

    // There should be limited number of keywords when not expanded
    expect(renderResult.getAllByTestId("tag")).toHaveLength(12);

    // All keywords should be shown when expanded
    act(() => renderResult.getByTestId("expand-keywords").click());
    expect(renderResult.getAllByTestId("tag")).toHaveLength(15);
  });

  it('should abort ELSST term fetch when unmounting', async () => {
    const keywords = ["1", "2", "3", "4"];

    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    const { renderResult: renderResult } = setup({
      keywords: keywords.map(t => getKeyword(t))
    });

    expect(abortSpy).toHaveBeenCalledTimes(0);

    // Await the promise - needed because otherwise setState() could be called on the unmounted component
    // See https://github.com/enzymejs/enzyme/issues/2278 for a description of the issue
    await promise;

    // Unmount the component
    renderResult.unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    // Restore the original implementation
    abortSpy.mockRestore();
  });
});
