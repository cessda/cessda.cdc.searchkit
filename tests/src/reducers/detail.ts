// Copyright CESSDA ERIC 2017-2021
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import detail from "../../../src/reducers/detail";

// @ts-expect-error
const initialState = detail(undefined, {});

describe('Detail reducer', () => {
  it('should handle UPDATE_SIMILARS', () => {
    expect(
      detail(
        {
          ...initialState,
          similars: []
        },
        {
          type: 'UPDATE_SIMILARS',
          similars: [
            {
              id: '1',
              title: 'Study Title 1'
            },
            {
              id: '2',
              title: 'Study Title 2'
            },
            {
              id: '3',
              title: 'Study Title 3'
            },
            {
              id: '4',
              title: 'Study Title 4'
            }
          ]
        }
      )
    ).toEqual({
      ...initialState,
      similars: [
        {
          id: '1',
          title: 'Study Title 1'
        },
        {
          id: '2',
          title: 'Study Title 2'
        },
        {
          id: '3',
          title: 'Study Title 3'
        },
        {
          id: '4',
          title: 'Study Title 4'
        }
      ]
    });
  });

  it('should handle unknown action type', () => {
    const state = initialState;
    // @ts-expect-error
    expect(detail(state, {})).toEqual(state);
  });
});
