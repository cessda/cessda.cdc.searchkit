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
import { App, Props, mapDispatchToProps } from '../../../src/containers/App';

// Mock props and shallow render container for test.
function setup(providedProps: Partial<Props> = {}) {
  const props = {
    initSearchkit: jest.fn(),
    initTranslations: jest.fn(),
    updateTotalStudies: jest.fn(),
    location: {
      key: 'key',
      state: {}
    },
    children: <div key={undefined}/>,
    ...providedProps
  };
  const enzymeWrapper = shallow(<App {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('App container', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.exists()).toBe(true);
  });

  it('should add key to children (search page) if page is required to refresh via location state variable', () => {
    const { enzymeWrapper, props } = setup({
      location: {key: 'newkey', state: {requireRefresh: true}}
    });
    expect(enzymeWrapper.find('div').key()).toEqual('newkey');
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(jest.fn())).toEqual({
      initSearchkit: expect.any(Function),
      initTranslations: expect.any(Function),
      updateTotalStudies: expect.any(Function)
    });
  });
});
