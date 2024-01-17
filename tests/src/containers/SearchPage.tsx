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

import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';
import { mapStateToProps, Props, SearchPage } from '../../../src/containers/SearchPage';

// Mock props and shallow render container for test.
function setup(partialProps?: Partial<Props>) {
  const props = _.extend(
    {
      showMobileFilters: false,
      filters: {}
    },
    partialProps || {}
  );
  const enzymeWrapper = shallow(<SearchPage {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('SearchPage container', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const searchPage = enzymeWrapper.find('SearchkitProvider');
    expect(searchPage.exists()).toBe(true);
  });

  it('should auto expand filter panels if filter active', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.setProps({
      filters: {
        'classifications.term': ['Term'],
        'keywords_term': 'keyword'
      }
    });
    const searchPage = enzymeWrapper.find('SearchkitProvider');
    expect(searchPage.exists()).toBe(true);
  });

  it('should apply class when mobile filters visible', () => {
    const { enzymeWrapper } = setup({
      showMobileFilters: true
    });
    expect(enzymeWrapper.find('.show-mobile-filters').exists()).toBe(true);
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        //@ts-ignore
        search: {
          showMobileFilters: props.showMobileFilters,
          state: props.filters
        }
      })
    ).toEqual({
      showMobileFilters: props.showMobileFilters,
      filters: props.filters
    });
  });
});
