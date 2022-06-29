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
import PageSizeSelector from '../../../src/components/PageSizeSelector';
import searchkit from '../../../src/utilities/searchkit';

// Mock props and shallow render component for test.
function setup() {
  const props = {
    searchkit: searchkit,
    options: [10, 30, 50, 150]
  };
  const enzymeWrapper = shallow<PageSizeSelector>(<PageSizeSelector {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('PageSizeSelector component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.exists()).toBe(true);
  });

  it('should handle has hits', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.instance().hasHits()).toBe(true);
  });
});
