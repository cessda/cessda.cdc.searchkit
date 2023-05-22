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

import {SearchBox as SearchkitSearchBox, SearchBoxProps} from 'searchkit';
import {connect, Dispatch} from 'react-redux';
import {push} from 'react-router-redux';
import {AnyAction, bindActionCreators} from 'redux';
import type {State} from '../types';
import {detect} from 'detect-browser';
import _ from 'lodash';

type DispatchAndState = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

export type Props = SearchBoxProps & DispatchAndState

// Extend the Searchkit SearchBox component to limit maximum characters and provide redirection.
export class SearchBox extends SearchkitSearchBox {
  
  props: Props;

  constructor(props: Props) {
    const derivedProps = {
      ...SearchBox.defaultProps,
      ...props
    };
    super(derivedProps);
    this.props = derivedProps;
  }

  static defaultProps = {
    ...SearchkitSearchBox.defaultProps as typeof SearchkitSearchBox.defaultProps & { blurAction: "search"}, 
    pathname: '',
    push,
    query: ''
  };

  onChange(event: Event): void {
    const {
      pathname,
      query
    } = this.props;

    const target = event.target as HTMLInputElement;

    // Do not process queries with more than 250 characters.
    if (target.value.length > 250) {
      return;
    }

    // Redirect from 'detail' page to 'search results' page if users change search query text.
    if (_.trim(pathname, '/')) {
      if (detect()?.name === 'ie') {
        // Workaround for legacy Internet Explorer bug where change event is fired multiple times.
        if (target.value !== query) {
          this.props.push('/');
        }
      } else {
        this.props.push('/');
      }
    }

    super.onChange(event);
  }

  /**
   * Clears the query on the detail page
   */
  getValue(): string {
    if (_.trim(this.props.pathname, '/')) {
      return "";
    } else {
      return super.getValue();
    }
  }
}

export function mapStateToProps(state: State) {
  return {
    pathname: state.routing.locationBeforeTransitions.pathname,
    query: state.search.state.q
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    push: bindActionCreators(push, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
