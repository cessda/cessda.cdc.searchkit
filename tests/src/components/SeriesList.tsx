// Copyright CESSDA ERIC 2017-2024
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
import { mount } from 'enzyme';
import SeriesList from '../../../src/components/SeriesList';
import { Series } from '../../../common/metadata';
import { mockStudy } from '../../common/mockdata';

// Helper function to set up tests with provided props
function setup(providedProps: Partial<{ seriesList: Series[] }> = {}) {
  const defaultProps = {
    seriesList: mockStudy.series,
  };

  const props = { ...defaultProps, ...providedProps };
  const lang = 'en';

  const enzymeWrapper = mount(<SeriesList {...props} lang={lang} />);
  return { props, enzymeWrapper, lang };
}

describe('SeriesList component', () => {
  it('should render a list of SeriesDetail components', () => {
    const { enzymeWrapper } = setup();

    const seriesDetails = enzymeWrapper.find('SeriesDetail');
    expect(seriesDetails).toHaveLength(2);
  });

  it('should render a "not available" message if the series list is empty', () => {
    const { enzymeWrapper } = setup({ seriesList: [] });

    expect(enzymeWrapper.find('div').text()).toContain('language.notAvailable.field');
  });

  it('should render names and descriptions correctly', () => {
    const { enzymeWrapper } = setup();
    const pElements = enzymeWrapper.find('p');

    expect(pElements.length).toBe(4);
    expect(pElements.at(0).text()).toBe('Series 1');
    expect(pElements.at(1).text()).toBe('Series 1 Description');
    expect(pElements.at(2).text()).toBe('Series 2');
    expect(pElements.at(3).text()).toBe('Series 2 Description');
  });

  it('should render names with URIs when available', () => {
    const { enzymeWrapper } = setup();

    const links = enzymeWrapper.find('a');
    expect(links).toHaveLength(2);
    expect(links.at(0).prop('href')).toBe('http://example.com/1');
    expect(links.at(1).prop('href')).toBe('http://example.com/2');
  });

  it('should render with just description', () => {
    const { enzymeWrapper } = setup({
      seriesList: [
        { names: [], descriptions: ['No name or URI'], uris: [] },
      ],
    });

    expect(enzymeWrapper.find('p').text()).toBe('No name or URI');
  });

  it('should render remaining URIs when there are more URIs than names', () => {
    const { enzymeWrapper } = setup({
      seriesList: [
        { names: ['Series 1'], descriptions: ['Description'], uris: ['http://example.com/uri1', 'http://example.com/uri2'] },
      ],
    });

    // Check that the second URI is rendered
    const uriLinks = enzymeWrapper.find('a');
    expect(uriLinks.at(1).prop('href')).toBe('http://example.com/uri2');
  });

  it('should toggle multiple descriptions correctly', () => {
    const description1 = 'a '.repeat(200);
    const shortDescription2 = 'b '.repeat(98) + 'b...';
    const longDescription2 = 'b '.repeat(500);
    const description3 = 'c '.repeat(100);

    const { enzymeWrapper } = setup({
      seriesList: [
        { names: ['Series 1'], descriptions: [description1, longDescription2, description3], uris: ['http://example.com/uri1'] },
      ],
    });

    // Check initial truncation
    expect(enzymeWrapper.find('p').length).toBe(3);
    expect(enzymeWrapper.find('p').at(1).text()).toBe(description1);
    expect(enzymeWrapper.find('p').at(2).text()).toBe(shortDescription2);

    // Simulate clicking "Read more"
    enzymeWrapper.find('a.button').simulate('click');

    // Check if descriptions expand
    expect(enzymeWrapper.find('p').length).toBe(4);
    expect(enzymeWrapper.find('p').at(1).text()).toBe(description1);
    expect(enzymeWrapper.find('p').at(2).text()).toBe(longDescription2);
    expect(enzymeWrapper.find('p').at(3).text()).toBe(description3);
  });
});
