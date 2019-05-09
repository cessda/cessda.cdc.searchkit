import * as _ from 'lodash';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Pagination } from '../../src/components/Pagination';

Enzyme.configure({ adapter: new Adapter() });

// Mock props and shallow render component for test.
function setup(props) {
  props = _.extend(
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
      setItems: jest.fn()
    },
    props || {}
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