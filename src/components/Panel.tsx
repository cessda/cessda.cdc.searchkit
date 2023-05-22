
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
import { Panel as SearchkitPanel, PanelProps } from 'searchkit';
import PropTypes from 'prop-types';
import { connect, Dispatch } from 'react-redux';
import type { State } from '../types';
import { AnyAction, bindActionCreators } from 'redux';
import { toggleMetadataPanels, ToggleMetadataPanelsAction } from '../actions/search';

// @ts-expect-error - redefines types to include JSX elements
export interface Props extends PanelProps {
  title? : JSX.Element | string;
  tooltip?: JSX.Element | string;
  linkCollapsedState?: boolean;
  expandMetadataPanels: boolean;
  toggleMetadataPanels: () => ToggleMetadataPanelsAction;
}

// Extend the Searchkit Panel component to support tooltips and translations.
export class Panel extends SearchkitPanel {
  // @ts-expect-error - redefines types to include JSX elements
  props: Props;

  static readonly defaultProps = {
    ...SearchkitPanel.defaultProps, 
    expandMetadataPanels: false,
    toggleMetadataPanels
  };

  constructor(props: Props = Panel.defaultProps) {
    super(props);
    this.props = props;
  }

  // @ts-expect-error - redefines types to include JSX elements
  componentDidUpdate(prevProps: Props): void {
    if (this.props.linkCollapsedState &&
        this.props.expandMetadataPanels !== prevProps.expandMetadataPanels &&
        this.state.collapsed !== !this.props.expandMetadataPanels) {
      this.toggleCollapsed();
    }
  }

  toggleCollapsed(): void {
    super.toggleCollapsed();
    if (this.props.linkCollapsedState &&
        this.state.collapsed !== this.props.expandMetadataPanels) {
      this.props.toggleMetadataPanels();
    }
  }

  render() {
    const {
      tooltip
    } = this.props;

    return (
      <section className={'sk-panel__container' + (this.state.collapsed ? ' sk-panel__collapsed' : '')}>
        {tooltip}
        {super.render()}
      </section>
    );
  }
}

// Override Panel type checking to avoid errors.
Panel.propTypes = Object.assign(SearchkitPanel.propTypes, {
  title: PropTypes.any,
  tooltip: PropTypes.any,
  linkCollapsedState: PropTypes.bool,
  expandMetadataPanels: PropTypes.bool,
  toggleMetadataPanels: PropTypes.func
});

export const mapStateToProps = (state: State) => {
  return {
    expandMetadataPanels: state.search.expandMetadataPanels
  };
};

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    toggleMetadataPanels: bindActionCreators(toggleMetadataPanels, dispatch)
  };
};

// @ts-expect-error - redefines types to include JSX elements
export default connect(mapStateToProps, mapDispatchToProps)(Panel) as ComponentClass<
  Omit<Props, "expandMetadataPanels" | "toggleMetadataPanels"> & Props
>;
