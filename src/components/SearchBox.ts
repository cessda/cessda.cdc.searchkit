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

import {SearchBox as SearchkitSearchBox, SearchBoxProps} from 'searchkit';
import {connect, Dispatch} from 'react-redux';
import {push, replace} from 'react-router-redux';
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
    replace,
    query: ''
  };

  componentDidUpdate() {
    // After redirection, there's a short time window (until page is fully loaded) where next input will
    // basically overwrite the first character entered before redirection. This way we can add it back.
    // Could technically always be checked and not just when redirected is true
    // but it's not really needed in any other case.
    if(this.props.locationState && this.props.locationState.redirected){
      const target = document.getElementsByClassName("sk-search-box__text")[0] as HTMLInputElement;
      if(target && target.value){
        // Check if value should be fixed
        if(target.value !== this.props.query){
          // Fix input field text by updating value and dispatching input event.
          const valueSetter = (Object.getOwnPropertyDescriptor(target, 'value') || Object.create(null)).set;
          const prototype = Object.getPrototypeOf(target);
          const prototypeValueSetter = (Object.getOwnPropertyDescriptor(prototype, 'value') || Object.create(null)).set;
          if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(target, `${this.props.query}${target.value}`);
          } else {
            valueSetter.call(target, `${this.props.query}${target.value}`);
          }
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        // Reset redirected back to false in any case since fix will only be needed once or not at all.
        this.props.replace({ pathname: '/', search: `?q=${target.value}`, state: { redirected: false } });
      }
    }
  }

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
          this.props.push({ pathname: '/', state: { redirected: true } });
        }
      } else {
        this.props.push({ pathname: '/', state: { redirected: true } });
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
    locationState: state.routing.locationBeforeTransitions.state,
    pathname: state.routing.locationBeforeTransitions.pathname,
    query: state.search.state.q
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    push: bindActionCreators(push, dispatch),
    replace: bindActionCreators(replace, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
