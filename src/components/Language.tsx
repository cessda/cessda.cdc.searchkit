
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

import React, {Component} from 'react';
import {connect, Dispatch} from 'react-redux';
import {changeLanguage} from '../actions/language';
import {AnyAction, bindActionCreators} from 'redux';
import type {State} from '../types';
import Select, { Options } from 'react-select';
import { browserHistory } from 'react-router';
import { push } from 'react-router-redux';
import counterpart from 'counterpart';

type Props = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

export class Language extends Component<Props> {

  render() {
    const {
      currentLanguage,
      list,
      push,
      changeLanguage
    } = this.props;

    const languages: Options<string> = list.map(language => {
      return {
        label: language.label,
        value: language.code
      };
    });

    return (
      <div className="language-picker">
        <Select value={currentLanguage.code}
                options={languages}
                searchable={false}
                clearable={false}
                autosize={true}
                aria-label={counterpart.translate("search.languageSelect")}
                onChange={(option) => {
                  if (option && !Array.isArray(option) && option.value) {
                    const currentLocation = browserHistory.getCurrentLocation();
                    if (currentLocation.pathname === "/") {
                      // Change language directly on the search page
                      changeLanguage(option.value);
                    } else {
                      // Change the language parameter in the URL, this triggers the language change and updates the history
                      push({
                        pathname: currentLocation.pathname,
                        query: {
                          ...currentLocation.query,
                          lang: option.value
                        }
                      });
                    }
                  }
                }}/>
      </div>
    );
  }
}

export function mapStateToProps(state: Pick<State, "language">) {
  return {
    currentLanguage: state.language.currentLanguage,
    list: state.language.list
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    changeLanguage: bindActionCreators(changeLanguage, dispatch),
    push: bindActionCreators(push, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Language);
