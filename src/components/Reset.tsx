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
import {connect} from 'react-redux';
import type {State} from '../types';

export type Props = {
  bemBlock: (...args: Array<any>) => any;
  hasFilters: boolean;
  translate: (arg0: string) => string;
  resetFilters: () => void;
} & ReturnType<typeof mapStateToProps>;

export function Reset(props: Props) {
  const {
    pathname,
    bemBlock,
    hasFilters,
    translate,
    resetFilters
  } = props;

  return (
    <a className={bemBlock().mix('link').state({disabled: pathname !== '/' || !hasFilters})}
        onClick={() => {
          if (pathname === '/' && hasFilters) {
            resetFilters();
          }
        }}
        tabIndex={0}>
      {translate('reset.clear_all')}
    </a>
  );
}

export const mapStateToProps = (state: State) => {
  return {
    pathname: state.routing.locationBeforeTransitions.pathname
  };
};

export default connect(mapStateToProps)(Reset);
