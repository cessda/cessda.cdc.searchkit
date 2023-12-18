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

import { Component, cloneElement } from "react";
import { AnyAction, bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { initSearchkit, updateTotalStudies } from "../actions/search";
import { initTranslations } from "../actions/language";

export interface Props extends ReturnType<typeof mapDispatchToProps> {
  location: {
    key: string;
    state?: {
      requireRefresh?: boolean;
    };
  };
  children: JSX.Element
}

export class App extends Component<Props> {

  constructor(props: Props) {
    super(props);
    this.props.initSearchkit();
    this.props.initTranslations();
    this.props.updateTotalStudies();
  }

  render() {
    // state.requireRefresh is used to make sure page gets updated when location is the same by
    // adding an updated key for search page (otherwise undefined), e.g. clicking on keywords in search results
    if(this.props.location.state && this.props.location.state.requireRefresh){
      return cloneElement(this.props.children, { key: this.props.location.key });
    } else {
      return this.props.children;
    }
  }
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    initSearchkit: bindActionCreators(initSearchkit, dispatch),
    initTranslations: bindActionCreators(initTranslations, dispatch),
    updateTotalStudies: bindActionCreators(updateTotalStudies, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(App);
