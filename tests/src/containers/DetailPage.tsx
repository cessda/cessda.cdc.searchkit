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

import React from 'react';
import { shallow } from 'enzyme';
import { DetailPage, mapDispatchToProps, mapStateToProps, Props } from '../../../src/containers/DetailPage';
import { languageMap, languages } from '../../../src/utilities/language';
import { mockStudy } from '../../common/mockdata';

// Mock props and shallow render container for test.
function setup(partialProps?: Partial<Props>) {
  const props = {
    item: mockStudy,
    availableLanguages: [],
    currentLanguage: languages[0],
    query: "1",
    goBack: jest.fn(),
    updateStudy: jest.fn(),
    push: jest.fn(),
    ...partialProps
  };
  const enzymeWrapper = shallow<DetailPage>(<DetailPage {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('DetailPage container', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const detailPage = enzymeWrapper.find('SearchkitProvider');
    expect(detailPage.exists()).toBe(true);
  });

  it('should show message when study not found', () => {
    const { enzymeWrapper } = setup({
      item: undefined
    });
    expect(enzymeWrapper.find('.panel.pt-15').exists()).toBe(true);
  });

  it('should map state to props with displayed item', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        routing: {
          //@ts-expect-error
          locationBeforeTransitions: {
            query: {
              q: props.query
            }
          }
        },
        language: {
          currentLanguage: props.currentLanguage,
          list: []
        },
        detail: {
          languageAvailableIn: [],
          study: props.item,
          similars: []
        }
      })
    ).toEqual({
      item: props.item,
      currentLanguage: props.currentLanguage,
      query: props.query,
      availableLanguages: []
    });
  });

  it('should map state to props with missing item', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        routing: {
          //@ts-expect-error
          locationBeforeTransitions: {
            query: {
              q: props.query
            }
          }
        },
        language: {
          currentLanguage: props.currentLanguage,
          list: []
        },
        detail: {
          languageAvailableIn: [languages[0]],
          study: undefined,
          similars: []
        }
      })
    ).toEqual({
      item: undefined,
      currentLanguage: props.currentLanguage,
      query: props.query,
      availableLanguages: [languages[0]]
    });
  });

  it('should update study on mount', () => {
    const { props } = setup({ query: "2" });
    expect(props.updateStudy).toBeCalledWith("2");
  });

  it('should update if study title changes', () => {
    const { enzymeWrapper, props } = setup();

    // Create a new props object with the same content
    enzymeWrapper.setProps({
      ...props
    });

    // Study didn't change, so updateStudy should only be called once
    expect(props.updateStudy).toHaveBeenCalledTimes(0);

    // Update the study ID
    enzymeWrapper.setProps({
      query: "2"
    });

    // Expect updateStudy to be called with the new study ID
    expect(props.updateStudy).toHaveBeenCalledTimes(1);
    expect(props.updateStudy).toBeCalledWith("2");
  });

  it('should not update study if query is empty', () => {
    const { enzymeWrapper, props } = setup();

    enzymeWrapper.setProps({
      query: undefined
    });

    // props.updateStudy() should have only been called on initialisation
    expect(props.updateStudy).toHaveBeenCalledTimes(0);
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(i => i)).toEqual({
      goBack: expect.any(Function),
      updateStudy: expect.any(Function),
      push: expect.any(Function)
    });
  });
});
