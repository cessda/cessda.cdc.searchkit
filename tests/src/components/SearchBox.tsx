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
import { mount, shallow } from 'enzyme';
import { mapDispatchToProps, mapStateToProps, SearchBox, Props } from '../../../src/components/SearchBox';
import searchkit from '../../../src/utilities/searchkit';
import { Browser, detect } from 'detect-browser';

// Mock detect() in detect-browser module.
jest.mock('detect-browser', () => ({
  detect: jest.fn()
}));

// Mock props and shallow render component for test.
function setup(partialProps?: Partial<Props>, browser?: Browser) {
  const props = _.extend(
    {
      searchkit: searchkit,
      pathname: '/',
      push: jest.fn(),
      replace: jest.fn(),
      query: 'search text',
      locationState: {
        redirected: false
      }
    },
    partialProps || {}
  );

  // Mock detect-browser detect() to return custom browser type.
  (detect as jest.MockedFunction<typeof detect>).mockImplementation(() =>  ({
    name: browser || "chrome",
    version: (browser === "ie") ? "11" : "90",
    os: null,
    type: "browser"
  }));

  const enzymeWrapper = shallow<SearchBox>(<SearchBox {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('SearchBox component', () => {
  afterEach(() => {
    // Only a single instance of BaseQueryAccessor is allowed so remove existing.
    searchkit.removeAccessor(searchkit.getQueryAccessor());
  });

  it('should render', () => {
    const { enzymeWrapper } = setup();
    const searchBox = enzymeWrapper.find('.sk-search-box');
    expect(searchBox.exists()).toBe(true);
  });

  it('should handle on change with queries over 250 characters', () => {
    const { props, enzymeWrapper } = setup();
    enzymeWrapper.instance().onChange({
      target: {
        //@ts-expect-error - only required values are provided
        value: 'Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus magna fringilla urna porttitor dolor purus non enim praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque.'
      }
    });
    expect(props.push).not.toHaveBeenCalled();
  });

  it('should handle on change when on search page', () => {
    const { props, enzymeWrapper } = setup();
    enzymeWrapper.instance().onChange({
      target: {
        //@ts-expect-error - only required values are provided
        value: props.query
      }
    });
    expect(props.push).not.toHaveBeenCalled();
  });

  it('should handle on change when on detail page', () => {
    const { props, enzymeWrapper } = setup({
      pathname: '/detail'
    });
    enzymeWrapper.instance().onChange({
      target: {
        //@ts-expect-error - only required values are provided
        value: props.query
      }
    });
    expect(props.push).toHaveBeenCalled();
  });

  it('should handle on change when on detail page using IE', () => {
    const { props, enzymeWrapper } = setup(
      {
        pathname: '/detail'
      },
      'ie'
    );
    enzymeWrapper.instance().onChange({
      target: {
        //@ts-expect-error - only required values are provided
        value: props.query
      }
    });
    expect(props.push).not.toHaveBeenCalled();
  });

  it('should handle on change when on detail page using IE and apply workaround', () => {
    const { props, enzymeWrapper } = setup(
      {
        pathname: '/detail'
      },
      'ie'
    );
    enzymeWrapper.instance().onChange({
      target: {
        //@ts-expect-error - only required values are provided
        value: 'query'
      }
    });
    expect(props.push).toHaveBeenCalled();
  });

  it('should fix value after redirection when query and input value are not the same', () => {
    // Simulate user typing 'test' on e.g. /detail page by having query as 't' while
    // text input field has 'est' and redirected is set to true
    const { props, enzymeWrapper } = setup(
      {
        pathname: '/',
        query: 't',
        locationState: {
          redirected: true
        }
      },
    );
    const inputField = mount(enzymeWrapper.find('input').first().getElement());
    inputField.setProps({ value: 'est' });
    const getElementSpy = jest.spyOn(document, 'getElementsByClassName').mockImplementation(() =>
      [inputField.getDOMNode()] as unknown as HTMLCollectionOf<Element>
    )

    // Trigger componentDidUpdate()
    enzymeWrapper.setProps({ ...props });

    // Check that replace has been called with query 'test'
    expect(props.replace).toHaveBeenCalledWith({
      pathname: '/',
      search: '?q=test',
      state: { redirected: false }
    });

    getElementSpy.mockRestore();
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        routing: {
          //@ts-expect-error
          locationBeforeTransitions: {
            pathname: props.pathname,
            state: props.locationState
          }
        },
        //@ts-expect-error
        search: {
          state: {
            q: props.query
          }
        }
      })
    ).toEqual({
      pathname: props.pathname,
      locationState: props.locationState,
      query: props.query
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(i => i)).toEqual({
      push: expect.any(Function),
      replace: expect.any(Function)
    });
  });
});
