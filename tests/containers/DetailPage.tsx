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

import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';
import { DetailPage, mapDispatchToProps, mapStateToProps, Props } from '../../src/containers/DetailPage';
import { languages } from '../../src/utilities/language';

// Mock props and shallow render container for test.
function setup(partialProps?: Partial<Props>) {
  const props = _.extend(
    {
      loading: false,
      item: {
        id: "1",
        studyUrl: 'http://example.com'
      },
      jsonLd: {},
      currentLanguage: languages[0],
      query: "1",
      goBack: jest.fn(),
      updateStudy: jest.fn()
    },
    partialProps || {}
  );
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
        //@ts-expect-error
        search: {
          loading: props.loading,
          displayed: [props.item],
          jsonLd: props.jsonLd
        }
      })
    ).toEqual({
      loading: props.loading,
      item: props.item,
      jsonLd: props.jsonLd,
      currentLanguage: props.currentLanguage,
      query: props.query
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
        //@ts-expect-error
        search: {
          loading: props.loading,
          displayed: [],
          jsonLd: props.jsonLd
        }
      })
    ).toEqual({
      loading: props.loading,
      item: undefined,
      jsonLd: props.jsonLd,
      currentLanguage: props.currentLanguage,
      query: props.query
    });
  });

  it('should update study on mount', () => {
    const { props } = setup();
    expect(props.updateStudy).toBeCalledWith(props.item.id);
  });

  it('should update if study title changes', () => {
    const { enzymeWrapper, props } = setup();
    enzymeWrapper.setProps({
      ...props
    });

    // Study didn't change, so updateStudy should only be called once
    expect(props.updateStudy).toHaveBeenCalledTimes(1);

    // Update the study ID
    enzymeWrapper.setProps({
      ...props,
      query: "2"
    });

    // Expect updateStudy to be called with the new study ID
    expect(props.updateStudy).toHaveBeenCalledTimes(2);
    expect(props.updateStudy).toBeCalledWith("2");
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(i => i)).toEqual({
      goBack: expect.any(Function),
      updateStudy: expect.any(Function)
    });
  });
});
