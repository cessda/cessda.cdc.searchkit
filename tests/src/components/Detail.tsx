// Copyright CESSDA ERIC 2017-2021
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
import { mount, shallow } from 'enzyme';
import Detail from '../../../src/components/Detail';
import { CMMStudy } from '../../../common/metadata';

// Mock props and shallow render component for test.
function setup(item?: Partial<CMMStudy>) {
  const props = {
    index: 0,
    item: {
      id: "1",
      titleStudy: 'Study Title',
      titleStudyHighlight: '',
      abstract: 'Abstract',
      abstractHighlight: '',
      abstractHighlightShort: '',
      abstractExpanded: false,
      abstractShort: 'Abstract',
      classifications: [
        {
          id: 'UKDS1234',
          term: 'Term',
          vocab: 'Vocab',
          vocabUri: 'http://example.com'
        }
      ],
      code: 'UKDS',
      creators: [
        'Jane Doe',
        'University of Essex',
        'John Smith (University of Essex)',
        'Joe Bloggs, University of Essex'
      ],
      dataAccessFreeTexts: ['Data Access Free Texts'],
      dataCollectionFreeTexts: [],
      dataCollectionPeriodEnddate: '',
      dataCollectionPeriodStartdate: '2001',
      fileLanguages: ['en'],
      keywords: [
        {
          id: 'UKDS1234',
          term: 'Term',
          vocab: 'Vocab',
          vocabUri: 'http://example.com'
        }
      ],
      langAvailableIn: ['EN'],
      lastModified: '2001-01-01T12:00:00Z',
      pidStudies: [
        {
          agency: 'UKDS',
          pid: 'UKDS1234'
        }
      ],
      publicationYear: '2001-01-01',
      publisher: {
        abbr: 'UKDS',
        publisher: 'UK Data Service'
      },
      samplingProcedureFreeTexts: [],
      studyAreaCountries: [
        {
          abbr: 'EN',
          country: 'England',
          searchField: 'England'
        }
      ],
      studyNumber: 'UKDS1234',
      studyUrl: 'http://example.com',
      typeOfModeOfCollections: [
        {
          id: 'UKDS1234',
          term: 'Term',
          vocab: 'Vocab',
          vocabUri: 'http://example.com'
        }
      ],
      typeOfTimeMethods: [
        {
          id: 'UKDS1234',
          term: 'Term',
          vocab: 'Vocab',
          vocabUri: 'http://example.com'
        }
      ],
      typeOfSamplingProcedures: [],
      unitTypes: [
        {
          id: 'UKDS1234',
          term: 'Term',
          vocab: 'Vocab',
          vocabUri: 'http://example.com'
        }
      ],
      studyXmlSourceUrl: '',
      universe: [],
      ...item
    } as CMMStudy,
    expandMetadataPanels: true,
    toggleMetadataPanels: jest.fn()
  };

  // Mock toggleMetadataPanels() to update state.
  props.toggleMetadataPanels.mockImplementation(() => props.expandMetadataPanels = !props.expandMetadataPanels);

  const enzymeWrapper = shallow(<Detail {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Detail component', () => {
  it('should render with supplied item', () => {
    const { enzymeWrapper } = setup();
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle no pidStudies provided', () => {
    const { enzymeWrapper } = setup({
      pidStudies: []
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle a pidStudy with no agency', () => {
    const { enzymeWrapper } = setup({
      pidStudies: [{
        pid: "TestPid",
        agency: "TestAgency"
      }]
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle no title provided', () => {
    const { enzymeWrapper } = setup({
      titleStudy: undefined
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle no publisher provided', () => {
    const { enzymeWrapper } = setup({
      publisher: undefined
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle no study number provided', () => {
    const { enzymeWrapper } = setup({
      studyNumber: undefined
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  });

  it('should handle generating elements with no value', () => {
    // "" is a falsy value, so should be dropped.
    expect(
      mount(<>{Detail.generateElements([""], "p", e => e)}</>).html()
    ).toContain('notAvailable');
  });

  it('should handle formatting dates with missing data', () => {
    expect(
      mount(<>{Detail.formatDate(Detail.dateFormatter)}</>).html()
    ).toContain('notAvailable');
  });

  it('should handle special case where array items are a start/end date range', () => {
    expect(
      mount(<>{
        Detail.formatDate(
          Detail.dateFormatter,
          undefined,
          undefined,
          [
            {
              dataCollectionFreeText: '2003-02-01',
              event: 'start'
            },
            {
              dataCollectionFreeText: '2006-05-04',
              event: 'end'
            }
          ]
        )}</>
      )
        .find('p')
        .text()
    ).toBe('01/02/2003 - 04/05/2006');
  });

  it('should handle formatting dates with fallback array containing date range', () => {
    expect(
      mount(<>{
        Detail.formatDate(
          Detail.dateFormatter,
          undefined,
          undefined,
          [
            {
              dataCollectionFreeText: '2003-02-01',
              event: ''
            },
            {
              dataCollectionFreeText: '2006-05-04',
              event: ''
            }
          ]
        )}</>
      )
        .find('div')
        .first()
        .text()
    ).toBe('01/02/2003');
  });

  it('should handle formatting dates with invalid first date', () => {
    expect(
      mount(<>{Detail.formatDate(Detail.dateFormatter, 'Not a date')}</>)
        .find('p')
        .text()
    ).toBe('Not a date');
  });

  it('should handle formatting dates as a range with invalid first date', () => {
    expect(
      mount(<>{Detail.formatDate(Detail.dateFormatter, 'Not a date', '2006-05-04')}</>)
        .find('p')
        .text()
    ).toBe('Not a date - 04/05/2006');
  });

  it('should handle formatting dates as a range with valid second date', () => {
    expect(
      mount(<>{Detail.formatDate(Detail.dateFormatter, '2003-02-01', '2006-05-04')}</>)
        .find('p')
        .text()
    ).toBe('01/02/2003 - 04/05/2006');
  });

  it('should handle formatting dates as a range with invalid second date', () => {
    expect(
      mount(<>{Detail.formatDate(Detail.dateFormatter, '2003-02-01', 'Not a date')}</>)
        .find('p')
        .text()
    ).toBe('01/02/2003 - Not a date');
  });

  it('should not reset metadata panels state on unmount if not expanded', () => {
    const { props, enzymeWrapper } = setup();
    enzymeWrapper.setProps({
      expandMetadataPanels: false
    });
    enzymeWrapper.unmount();
    expect(props.toggleMetadataPanels).not.toHaveBeenCalled();
  });
});
