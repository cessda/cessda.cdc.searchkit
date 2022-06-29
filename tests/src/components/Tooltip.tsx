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
import { shallow } from 'enzyme';
import Tooltip from '../../../src/components/Tooltip';

// Mock props and shallow render component for test.
function setup() {
  const props = {
    content: 'Content'
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
});
