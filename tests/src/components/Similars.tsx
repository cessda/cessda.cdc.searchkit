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

import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';
import { mapDispatchToProps, mapStateToProps, Props, Similars } from '../../../src/components/Similars';
import searchkit from '../../../src/utilities/searchkit';
import { mockStudy } from '../../common/mockdata';
import { Language, languages } from '../../../src/utilities/language';

// Mock props and shallow render component for test.
function setup(partialProps?: Partial<Props>) {
  const props = {
    similars: [
      {
        id: "1",
        title: 'Similar Study Title 1'
      },
      {
        id: "2",
        title: 'Similar Study Title 2'
      }
    ],
    currentLanguage: "en",
    push: jest.fn(),
    ...partialProps 
  };

  // Manually initialise searchkit history.
  searchkit.history = {
    location: {
      search: '?q=search%20text'
    },
    push: () => {
      // Mocked method stub.
    }
  };

  const enzymeWrapper = shallow(<Similars {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Similars component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const similars = enzymeWrapper.find('.similars');
    expect(similars.exists()).toBe(true);
  });

  it('should show message when no similar studies found', () => {
    const { enzymeWrapper } = setup({
      similars: []
    });
    expect(enzymeWrapper.find('.similars Translate').exists()).toBe(true);
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        detail: {
          languageAvailableIn: [],
          study: mockStudy,
          similars: props.similars,
        },
        language: {
          currentLanguage: languages.find(lang => lang.code === props.currentLanguage) as Language,
          list: languages
        },
      })
    ).toEqual({
      similars: props.similars,
      currentLanguage: props.currentLanguage
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(i => i)).toEqual({
      push: expect.any(Function)
    });
  });
});
