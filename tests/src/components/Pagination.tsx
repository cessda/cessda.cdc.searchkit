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

import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';

import Pagination from '../../../src/components/Pagination';
import { ItemListProps } from 'searchkit';

// Mock props and shallow render component for test.
function setup(partialProps?: Partial<ItemListProps>) {
  const props = _.extend(
    {
      items: [
        {
          key: '1',
          label: 'First',
          page: '1'
        },
        {
          key: '2',
          label: '2',
          page: '2'
        },
        {
          key: '3',
          label: '...',
          page: '3'
        },
        {
          key: '4',
          label: '4',
          page: '4'
        },
        {
          key: '5',
          label: 'Last',
          page: '5'
        }
      ],
      selectedItems: [],
      setItems: jest.fn(),
      toggleItem: function() {}
    },
    partialProps || {}
  );

  // Mock setItems() to update selected items.
  props.setItems.mockImplementation(items => {
    props.selectedItems = items;
  });

  const enzymeWrapper = shallow(<Pagination {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Pagination component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const pagination = enzymeWrapper.find('nav');
    expect(pagination.exists()).toBe(true);
  });

  it('should navigate to previous page', () => {
    const { props, enzymeWrapper } = setup();
    expect(props.selectedItems).toEqual([]);
    enzymeWrapper.find('.pagination-previous').simulate('click', {
      preventDefault: jest.fn()
    });
    expect(props.selectedItems).toEqual(['1']);
  });

  it('should navigate to next page', () => {
    const { props, enzymeWrapper } = setup();
    expect(props.selectedItems).toEqual([]);
    enzymeWrapper.find('.pagination-next').simulate('click', {
      preventDefault: jest.fn()
    });
    expect(props.selectedItems).toEqual(['5']);
  });

  it('should navigate to page number', () => {
    const { props, enzymeWrapper } = setup();
    expect(props.selectedItems).toEqual([]);
    enzymeWrapper
      .find('.pagination-link')
      .first()
      .simulate('click', {
        preventDefault: jest.fn()
      });
    expect(props.selectedItems).toEqual(['2']);
  });

  it('should highlight selected page', () => {
    const { enzymeWrapper } = setup({
      selectedItems: ['2']
    });
    const currentPage = enzymeWrapper.find('.is-current');
    expect(currentPage.exists()).toBe(true);
  });
});
