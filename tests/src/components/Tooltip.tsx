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
import Tooltip from '../../../src/components/Tooltip';

// Mock props and shallow render component for test.
function setup() {
  const props = {
    content: 'Content',
    id: 'test-tooltip',
    ariaLabel: 'Label'
  };
  const enzymeWrapper = shallow(<Tooltip {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Tooltip component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const tooltip = enzymeWrapper.find('.dropdown');
    expect(tooltip.exists()).toBe(true);
  });

  it('should display content', () => {
    const { props, enzymeWrapper } = setup();
    const tooltip = enzymeWrapper.find('.dropdown');
    expect(tooltip.find('p').text()).toBe(props.content);
  });

  it('should be closed by default', () => {
    const { enzymeWrapper } = setup();
    const tooltip = enzymeWrapper.find('.dropdown');
    expect(tooltip.hasClass('is-active')).toBe(false);
    expect(tooltip.find('.dropdown-item').prop('aria-hidden')).toBe('true');
  });

  it('should be open after clicking and closed after clicking again', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.find('.button').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(true);
    enzymeWrapper.find('.button').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(false);
  });

  it('should click tooltip button after pressing escape', () => {
    const { enzymeWrapper } = setup();
    const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: { click(){} } });
    enzymeWrapper.find('.button').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(true);
    enzymeWrapper.find('.button').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                        key: 'Escape', keyCode: 27, which: 27 })
    expect(useRefSpy).toBeCalledTimes(1);
    useRefSpy.mockRestore();
  });

  it('should be closed after pressing escape', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.find('.button').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(true);
    enzymeWrapper.find('.button').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                        key: 'Escape', keyCode: 27, which: 27 })
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(false);
  });


  it('should be closed after blur', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.find('.button').simulate('click', { preventDefault(){}, stopPropagation(){}});
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(true);
    enzymeWrapper.find('.dropdown').simulate('blur')
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(false);
  });

  it('should be open after mouseenter and closed after mouseleave', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.find('.dropdown').simulate('mouseenter')
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(true);
    enzymeWrapper.find('.dropdown').simulate('mouseleave')
    expect(enzymeWrapper.find('.dropdown').hasClass('is-active')).toBe(false);
  });
});
