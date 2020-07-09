// @flow
// Copyright CESSDA ERIC 2017-2019
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



import {SortingSelector as SearchkitSortingSelector} from 'searchkit';
import PropTypes from 'prop-types';
import counterpart from 'counterpart';
import * as _ from 'lodash';
import type {Node} from 'react';
import {connect} from 'react-redux';

type Props = {};

// Extend the Searchkit SortingSelector component to support translations.
export class SortingSelector extends SearchkitSortingSelector<Props> {
  hasHits(): boolean {
    // Override behaviour to always return true so that the control is never disabled and hidden.
    return true;
  }

  render(): Node {
    // _.map(this.accessor.options.options, (option: Object): Object => {
    //   option.label = counterpart.translate(option.translation);
    //   return option;
    // });
    return super.render();
  }
}

// Override SortingSelector type checking to avoid errors.
SortingSelector.propTypes = Object.assign(SearchkitSortingSelector.propTypes, {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      translation: PropTypes.string.isRequired,
      label: PropTypes.string,
      field: PropTypes.string,
      order: PropTypes.string,
      defaultOption: PropTypes.bool
    })
  )
});

export default connect()(SortingSelector);
