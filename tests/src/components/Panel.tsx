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
import { mapDispatchToProps, mapStateToProps, Panel, Props } from '../../../src/components/Panel';

// Mock props and shallow render component for test.
function setup(partialProps?: Partial<Props>) {
  const props = _.extend(
    {
      tooltip: {},
      defaultCollapsed: false,
      linkCollapsedState: false,
      expandMetadataPanels: false,
      toggleMetadataPanels: jest.fn()
    },
    partialProps || {}
  );

  // Mock toggleMetadataPanels() to update expanded state.
  props.toggleMetadataPanels.mockImplementation(() => {
    props.expandMetadataPanels = !props.expandMetadataPanels;
  });

  // @ts-expect-error
  const enzymeWrapper = shallow<Panel>(<Panel {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Panel component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const panel = enzymeWrapper.find('.sk-panel__container');
    expect(panel.exists()).toBe(true);
  });

  it('should refresh metadata panels state on update when linking collapsed state', () => {
    const { props, enzymeWrapper } = setup({
      linkCollapsedState: true,
      defaultCollapsed: false,
      expandMetadataPanels: true
    });
    expect(props.expandMetadataPanels).toBe(true);
    enzymeWrapper.setProps({
      expandMetadataPanels: false
    });
    expect(props.expandMetadataPanels).toBe(false);
  });

  it('should not refresh metadata panels state on update when not linking collapsed state', () => {
    const { props, enzymeWrapper } = setup({
      linkCollapsedState: false,
      defaultCollapsed: false,
      expandMetadataPanels: true
    });
    expect(props.expandMetadataPanels).toBe(true);
    enzymeWrapper.setProps({
      expandMetadataPanels: true
    });
    expect(props.expandMetadataPanels).toBe(true);
  });

  it('should handle toggle collapsed when linking collapsed state', () => {
    const { props, enzymeWrapper } = setup({
      linkCollapsedState: true
    });
    expect(props.expandMetadataPanels).toBe(false);
    enzymeWrapper.instance().toggleCollapsed();
    expect(props.expandMetadataPanels).toBe(true);
  });

  it('should handle toggle collapsed when not linking collapsed state', () => {
    const { props, enzymeWrapper } = setup({
      linkCollapsedState: false
    });
    expect(props.expandMetadataPanels).toBe(false);
    enzymeWrapper.instance().toggleCollapsed();
    expect(props.expandMetadataPanels).toBe(false);
  });

  it('should toggle collapsed when pressing enter or space except for exclusions', () => {
    const { enzymeWrapper } = setup({
      collapsable: true
    });
    const toggleCollapsedSpy = jest.spyOn((enzymeWrapper.instance() as Panel), 'toggleCollapsed')
    const panelMock = document.createElement('section');
    enzymeWrapper.find('.sk-panel__container').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                    target: panelMock,
                                                                    key: 'Enter', keyCode: 13, which: 13 })
    enzymeWrapper.find('.sk-panel__container').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                    target: panelMock,
                                                                    key: ' ', keyCode: 32, which: 32 })
    // Pressing enter on a link inside panel shouldn't toggle collapse
    const linkInPanelMock = document.createElement('a');
    enzymeWrapper.find('.sk-panel__container').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                    target: linkInPanelMock,
                                                                    key: 'Enter', keyCode: 13, which: 13 })
    // Pressing space on an element inside content part shouldn't toggle collapse
    const contentMock = document.createElement('div');
    contentMock.classList.add('sk-panel__content');
    const inputInContentMock = document.createElement('input');
    contentMock.appendChild(inputInContentMock);
    // Mock document.querySelectorAll so that it will return an element when looking for .sk-panel__content
    const originalQuerySelectorAll = document.querySelectorAll;
    const mockQuerySelectorAll = jest.fn((selector: string) => {
      if (selector === '.sk-panel__content') {
        return [contentMock] as unknown as NodeListOf<HTMLElement>;
      }
      return [] as unknown as NodeListOf<HTMLElement>;
    });
    document.querySelectorAll = mockQuerySelectorAll;
    enzymeWrapper.find('.sk-panel__container').simulate('keydown', { preventDefault(){}, stopPropagation(){},
                                                                    target: inputInContentMock,
                                                                    key: ' ', keyCode: 32, which: 32 })
    document.querySelectorAll = originalQuerySelectorAll;
    expect(toggleCollapsedSpy).toBeCalledTimes(2);
    toggleCollapsedSpy.mockRestore();
  });

  it('should map state to props', () => {
    const { props } = setup();
    expect(
      mapStateToProps({
        //@ts-expect-error
        search: {
          expandMetadataPanels: props.expandMetadataPanels
        }
      })
    ).toEqual({
      expandMetadataPanels: props.expandMetadataPanels
    });
  });

  it('should map dispatch to props', () => {
    expect(mapDispatchToProps(i => i)).toEqual({
      toggleMetadataPanels: expect.any(Function)
    });
  });
});
