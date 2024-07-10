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
import { mount, shallow } from 'enzyme';
import Detail, { Props } from '../../../src/components/Detail';
import { CMMStudy } from '../../../common/metadata';
import { mockStudy } from '../../common/mockdata';

// Mock props and shallow render component for test.
function setup(item?: Partial<CMMStudy>) {
  const props: Props = {
    item: {
      ...mockStudy,
      ...item
    },
    lang: "en"
  };

  const enzymeWrapper = shallow(<Detail {...props} />);
  const detailInstance = enzymeWrapper.instance() as Detail;
  return {
    props,
    enzymeWrapper,
    detailInstance
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
    const { detailInstance } = setup();
    // "" is a falsy value, so should be dropped.
    expect(
      mount(<>{detailInstance.generateElements([""], "div", e => e)}</>).html()
    ).toContain('notAvailable');
  });

  it('should handle joining values and returning them in div even if some have no value', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.joinValuesBySeparator([{"country": "Finland"}, {"country": ""},
                                             {"country": "Norway"}, {"country": "Sweden"},
                                             {"country": " "}],
                                             c => c.country, ", ")}</>).html()
    ).toContain('<div lang="en">Finland, Norway, Sweden</div>');
  });

  it('should handle formatting dates with missing data', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.formatDate(Detail.dateFormatter)}</>).html()
    ).toContain('notAvailable');
  });

  it('should handle special case where array items are a start/end date range', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{
        detailInstance.formatDate(
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
    const { detailInstance } = setup();
    expect(
      mount(<>{
        detailInstance.formatDate(
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
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.formatDate(Detail.dateFormatter, 'Not a date')}</>)
        .find('p')
        .text()
    ).toBe('Not a date');
  });

  it('should handle formatting dates as a range with invalid first date', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.formatDate(Detail.dateFormatter, 'Not a date', '2006-05-04')}</>)
        .find('p')
        .text()
    ).toBe('Not a date - 04/05/2006');
  });

  it('should handle formatting dates as a range with valid second date', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.formatDate(Detail.dateFormatter, '2003-02-01', '2006-05-04')}</>)
        .find('p')
        .text()
    ).toBe('01/02/2003 - 04/05/2006');
  });

  it('should handle formatting dates as a range with invalid second date', () => {
    const { detailInstance } = setup();
    expect(
      mount(<>{detailInstance.formatDate(Detail.dateFormatter, '2003-02-01', 'Not a date')}</>)
        .find('p')
        .text()
    ).toBe('01/02/2003 - Not a date');
  });

  it('should handle a related publication with no holdings', () => {
    const { enzymeWrapper } = setup({
      relatedPublications: [
        {
          title: "Related publications title",
          holdings: []
        }
      ]
    });
    const detail = enzymeWrapper.find('article.w-100');
    expect(detail.exists()).toBe(true);
  })

  it('should add funding information if it exists', () => {
    const fundingData = [
      {
        agency: "Some Agency",
        grantNumber: "ID000"
      },
      {
        agency: "Another Agency",
        grantNumber: "1234"
      },
      {
        grantNumber: "IdButNoAgency"
      },
      {
        agency: "Finnish Agency"
      }
    ];

    const { enzymeWrapper } = setup({ funding: fundingData });

    const fundingPanel = enzymeWrapper.find('#funding-information');
    expect(fundingPanel.exists()).toBe(true);

    fundingData.forEach((funding) => {
      expect(fundingPanel.contains(<p lang="en">{funding.agency}</p>)).toBe(funding.agency ? true : false);
      expect(fundingPanel.contains(<p lang="en">{funding.grantNumber}</p>)).toBe(funding.grantNumber ? true : false);
    });
  })

  it('should not add funding information if it does not exist', () => {
    const { enzymeWrapper } = setup({
      funding: []
    });

    const fundingPanel = enzymeWrapper.find('#funding-information');
    expect(fundingPanel.exists()).toBe(false);
  })
});
