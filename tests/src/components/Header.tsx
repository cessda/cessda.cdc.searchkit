// Copyright CESSDA ERIC 2017-2023
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
import { shallow } from 'enzyme';
import { Header, mapDispatchToProps, mapStateToProps, Props } from '../../../src/components/Header';
import _ from 'lodash';
import { languages } from '../../../src/utilities/language';

const initialProps: Props = {
  pathname: '/',
  currentLanguage: languages[0],
  filters: {},
  showFilterSummary: false,
  showMobileFilters: false,
  showAdvancedSearch: false,
  totalStudies: 0,
  resetSearch: jest.fn(),
  toggleSummary: jest.fn(),
  toggleMobileFilters: jest.fn(),
  toggleAdvancedSearch: jest.fn()
};

// Mock props and shallow render component for test.
function setup(partialProps?: Partial<Props>) {
  const props = {
    ...initialProps,
    ...partialProps
  }
  const enzymeWrapper = shallow(<Header {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Header component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const header = enzymeWrapper.find('header');
    expect(header.exists()).toBe(true);
  });

  it('should navigate to home from logo', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.find('.cessda-eric').simulate('click');
    
  });

  it('should show hide button when mobile filters visible', () => {
    const { enzymeWrapper } = setup({
      showMobileFilters: true
    });
    expect(enzymeWrapper.find('.mobile-filters-toggle').html()).toContain(
      'hideFilters'
    );
  });

  it('should apply active class when filter summary is visible', () => {
    const { enzymeWrapper } = setup({
      filters: undefined,
      showFilterSummary: true
    });
    expect(enzymeWrapper.find('.modal.is-active').length).toBe(1);
    expect(enzymeWrapper.find('.modal.is-active').exists()).toBe(true);
  });

  it('should apply active class when advanced search is visible', () => {
    const { enzymeWrapper } = setup({
      showAdvancedSearch: true
    });
    expect(enzymeWrapper.find('.modal.is-active').length).toBe(1);
    expect(enzymeWrapper.find('.modal.is-active').exists()).toBe(true);
  });

  it('should click target element after pressing enter or space on any filter related button', () => {
    const linkButtonMockFunction = jest.fn();
    const { enzymeWrapper } = setup({
      filters: {
        'classifications.term': ['Term'],
        'keywords_term': 'keyword'
      }
    });
    const linkButtonMock = document.createElement('a');
    linkButtonMock.addEventListener( 'click', () => linkButtonMockFunction());
    enzymeWrapper.find('#toggle-mobile-filters').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                      target: linkButtonMock,
                                                                      key: 'Enter', keyCode: 13, which: 13 })
    enzymeWrapper.find('#toggle-summary').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                target: linkButtonMock,
                                                                key: ' ', keyCode: 32, which: 32 })
    enzymeWrapper.find('#reset-filters').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                              target: linkButtonMock,
                                                              key: 'Enter', keyCode: 13, which: 13 })
    enzymeWrapper.find('#clear-search').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                              target: linkButtonMock,
                                                              key: ' ', keyCode: 32, which: 32 })
    expect(linkButtonMockFunction).toBeCalledTimes(4);
  });

  it('should toggle is-sr-only class for screen reader only elements on focus and blur', () => {
    const { enzymeWrapper } = setup();
    const linkMock = document.createElement('a');
    linkMock.classList.add('is-sr-only');
    const srOnlyElements = enzymeWrapper.find('.is-sr-only');
    srOnlyElements.forEach(element => {
      element.simulate('focus', { target: linkMock });
      expect(linkMock.classList).not.toContain('is-sr-only');
      element.simulate('blur', { target: linkMock });
      expect(linkMock.classList).toContain('is-sr-only');
    });
  });

  it('should focus toggle summary element after closing filter summary window', () => {
    jest.spyOn(React, 'createRef').mockReturnValueOnce({ current: document.createElement('a') });
    const { enzymeWrapper } = setup({
      filters: {
        'classifications.term': ['Term'],
        'keywords_term': 'keyword'
      },
      showFilterSummary: true
    });
    const focusToggleSummarySpy = jest.spyOn((enzymeWrapper.instance() as Header), 'focusToggleSummary')
    enzymeWrapper.find('#close-filter-summary-top').simulate('click', { preventDefault(){}, stopPropagation(){}});
    enzymeWrapper.find('#close-filter-summary-bottom').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(focusToggleSummarySpy).toBeCalledTimes(2);
    focusToggleSummarySpy.mockRestore();
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        routing: {
          //@ts-ignore
          locationBeforeTransitions: {
            pathname: props.pathname
          }
        },
        language: {
          currentLanguage: props.currentLanguage,
          list: []
        },
        //@ts-ignore
        search: {
          query: {
            post_filter: props.filters
          },
          showFilterSummary: props.showFilterSummary,
          showMobileFilters: props.showMobileFilters,
          showAdvancedSearch: props.showAdvancedSearch
        }
      })
    ).toEqual({
      pathname: props.pathname,
      currentLanguage: props.currentLanguage,
      filters: props.filters,
      showFilterSummary: props.showFilterSummary,
      showMobileFilters: props.showMobileFilters,
      showAdvancedSearch: props.showAdvancedSearch
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(a => a)).toEqual({
      resetSearch: expect.any(Function),
      toggleSummary: expect.any(Function),
      toggleMobileFilters: expect.any(Function),
      toggleAdvancedSearch: expect.any(Function)
    });
  });
});
