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
import { shallow } from 'enzyme';
import {
  mapDispatchToProps,
  mapStateToProps,
  Result
} from '../../../src/components/Result';
import { CMMStudy } from '../../../common/metadata';
import { Language, languages } from '../../../src/utilities/language';
import Keywords from '../../../src/components/Keywords';

// Mock props and shallow render component for test.
function setup(item?: Partial<CMMStudy> | false) {
  const props = {
    bemBlocks: {
      container: jest.fn(),
      item: jest.fn()
    },
    code: 'en',
    index: 0,
    item:
      item === false
        ? undefined
        : _.extend(
            {
              id: 1,
              titleStudy: 'Study Title',
              abstract: "Full Abstract.\nAipiscing elit ut aliquam purus sit amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non enim praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus.",
              abstractExpanded: false,
              abstractShort: 'Short Abstract',
              abstractLong: 'Long Abstract',
              abstractHighlight: 'Full Abstract highlighted',
              abstractHighlightShort: 'Short abstract highlighted',
              abstractHighlightLong: 'Long abstract highlighted',
              creators: [
                'Jane Doe',
                'University of Essex',
                'John Smith (University of Essex)'
              ],
              langAvailableIn: ['EN'],
              studyUrl: 'http://example.com',
              keywords: ["1", "2", "3", "4"]
            },
            item || {}
          ),
    push: jest.fn(),
    changeLanguage: jest.fn(),
    toggleLongAbstract: jest.fn()
  };

  // Mock bemBlocks.container() to manage CSS classes.
  props.bemBlocks.container.mockImplementation(classes => `sk-hits-list__${classes}`);

  // Mock bemBlocks.item() to manage CSS classes.
  props.bemBlocks.item.mockImplementation(() => {
    return {
      mix: jest.fn().mockImplementation(classes => {
        return classes;
      })
    };
  });

  // Mock toggleLongAbstract() to update long abstract visibility.
  props.toggleLongAbstract.mockImplementation(() => {
    if (props.item) {
      props.item.abstractExpanded = !props.item.abstractExpanded;
    }
  });

  //@ts-expect-error - missing props not used
  const enzymeWrapper = shallow(<Result {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Result component', () => {
  it('should render with supplied item', () => {
    const { enzymeWrapper } = setup();
    const result = enzymeWrapper.find('.list_hit');
    expect(result.exists()).toBe(true);
  });

  it('should not render with undefined item', () => {
    const { enzymeWrapper } = setup(false);
    const result = enzymeWrapper.find('.list_hit');
    expect(result.exists()).toBe(false);
  });

  it('should truncate number of creators displayed', () => {
    const { enzymeWrapper } = setup({
      creators: [
        { name: 'Jane Doe' },
        { name: 'University of Essex' },
        { name: 'John Smith', affiliation: 'University of Essex', identifier: { id: "0", type: "Test", uri: "http://localhost/0" } },
        { name: 'Joe Bloggs, University of Essex' }
      ]
    });
    expect(enzymeWrapper.find('.sk-hits-list__meta').text()).toContain(
      '(1 more)'
    );
  });

  it('should toggle long abstract', () => {
    const { enzymeWrapper } = setup();

    expect(enzymeWrapper.state('abstractExpanded')).toBe(false);
    expect(enzymeWrapper.find('.sk-hits-list__desc span.abstr').length).toBe(0);

    enzymeWrapper
      .find('.button')
      .at(0)
      .simulate('click');
    expect(enzymeWrapper.state('abstractExpanded')).toBe(true);
    expect(
      enzymeWrapper.find('.sk-hits-list__desc span').length
    ).toBeGreaterThan(0);
  });

  it('should toggle abstract when pressing enter or space', () => {
    const { enzymeWrapper } = setup();
    const handleAbstractExpansionSpy = jest.spyOn((enzymeWrapper.instance() as Result), 'handleAbstractExpansion')
    enzymeWrapper.find('.button').first().simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                key: 'Enter', keyCode: 13, which: 13 },
                                                              'Study title')
    enzymeWrapper.find('.button').first().simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                key: ' ', keyCode: 32, which: 32 },
                                                              'Study title')
    expect(handleAbstractExpansionSpy).toBeCalledTimes(2);
    handleAbstractExpansionSpy.mockRestore();
  });

  it('should change language', () => {
    const { props, enzymeWrapper } = setup();
    expect(props.changeLanguage).not.toHaveBeenCalled();
    expect(props.push).not.toHaveBeenCalled();
    enzymeWrapper
      .find('.button')
      .at(2)
      .simulate('click');
    expect(props.changeLanguage).toHaveBeenCalled();
  });

  it('should shuffle keywords and reshuffle if keywords change', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.2);

    const { props, enzymeWrapper } = setup();
    expect(enzymeWrapper.find(Keywords).props().keywords).toEqual(["2", "3", "4", "1"]);

    // Props updated but keywords didn't change so don't reshuffle
    enzymeWrapper.setProps({props})
    jest.spyOn(global.Math, 'random').mockReturnValue(0.8);
    expect(enzymeWrapper.find(Keywords).props().keywords).toEqual(["2", "3", "4", "1"]);

    // Props updated and keywords changed so reshuffle
    enzymeWrapper.setProps({...props, item: {...props.item, keywords: ["6", "5", "4", "3", "2", "1"]}})
    expect(enzymeWrapper.find(Keywords).props().keywords).toEqual(["6", "5", "4", "3", "1", "2"]);

    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should display "Open" when data access is Open', () => {
    const { enzymeWrapper } = setup({
      dataAccess: 'Open'
    });

    expect(enzymeWrapper.text()).toContain('Open');
  })

  it('should display "Restricted" when data access is Restricted', () => {
    const { enzymeWrapper } = setup({
      dataAccess: 'Restricted'
    });

    expect(enzymeWrapper.text()).toContain('Restricted');
  })

  it('should not display data access when it is undefined', () => {
    const { enzymeWrapper } = setup({
      dataAccess: undefined
    });

    expect(enzymeWrapper.text()).not.toContain('Open');
    expect(enzymeWrapper.text()).not.toContain('Restricted');
  })

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps(
        {
          language: {
            currentLanguage: languages.find(lang => lang.code === "en") as Language,
            list: languages
          },
          search: {
            //@ts-expect-error - missing props not used
            displayed: [props.item]
          }
        },
        props
      )
    ).toEqual({
      currentLanguage: "en",
      item: props.item
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(jest.fn())).toEqual({
      push: expect.any(Function),
      changeLanguage: expect.any(Function)
    });
  });
});
