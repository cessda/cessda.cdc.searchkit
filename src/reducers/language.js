// @flow
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

import type {Action} from '../actions';

type State = {
  code: string,
  label: string,
  list?: {
    code: string,
    label: string,
    index: string
  }[]
};

const initialState: State = {
  code: 'en',
  label: 'English'
};

const language = (state: State, action: Action): State => {
  if (typeof state === 'undefined') {
    return initialState;
  }

  switch (action.type) {
    case 'INIT_TRANSLATIONS':
      return Object.assign({}, state, {
        list: action.list
      });

    case 'CHANGE_LANGUAGE':
      return Object.assign({}, state, {
        code: action.code,
        label: action.label
      });

    default:
      return state;
  }
};

export default language;
