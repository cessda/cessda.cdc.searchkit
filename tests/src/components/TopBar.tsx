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
import TopBar from '../../../src/components/Topbar';

// Mock props and shallow render component for test.
function setup() {
  const enzymeWrapper = shallow(<TopBar/>);
  return {
    enzymeWrapper
  };
}

describe('TopBar component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const topBar = enzymeWrapper.find('.level');
    expect(topBar.exists()).toBe(true);
  });
});
