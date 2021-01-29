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
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Language, mapDispatchToProps, mapStateToProps } from '../../src/components/Language';

Enzyme.configure({ adapter: new Adapter() });

// Mock props and shallow render component for test.
function setup() {
  const props = {
    code: 'en',
    list: [
      {
        code: 'en',
        label: 'English',
        index: 'cmmstudy_en'
      },
      {
        code: 'fi',
        label: 'Suomi',
        index: 'cmmstudy_fi'
      }
    ],
    changeLanguage: jest.fn()
  };
  const enzymeWrapper = shallow(<Language {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Language component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const languagePicker = enzymeWrapper.find('.language-picker');
    expect(languagePicker.exists()).toBe(true);
  });

  it('should handle on change', () => {
    const { props, enzymeWrapper } = setup();
    expect(props.changeLanguage).not.toHaveBeenCalled();
    enzymeWrapper.find('Select').simulate('change', {
      target: {
        value: props.list[1]
      }
    });
    expect(props.changeLanguage).toHaveBeenCalled();
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        language: {
          code: props.code,
          list: props.list
        }
      })
    ).toEqual({
      code: props.code,
      list: props.list
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps()).toEqual({
      changeLanguage: expect.any(Function)
    });
  });
});
