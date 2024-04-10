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

import configureMockStore from 'redux-mock-store';
import { AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { updateStudy, UPDATE_STUDY, CLEAR_STUDY } from "../../../src/actions/detail";
import { Language, languageMap, languages } from "../../../src/utilities/language";
import { State } from '../../../src/types';
import { mockStudy } from '../../common/mockdata';
import { getStudyModel } from '../../../common/metadata';
import { Response } from 'node-fetch';

const mockStore = configureMockStore<Partial<State>, ThunkDispatch<State, never, AnyAction>>([thunk]);

describe('Detail actions', () => {
  describe('UPDATE_STUDY action', () => {
    it('is created when the displayed study is requested', async () => {
      const fetchMock = jest.fn();
      fetchMock.mockReturnValueOnce(Promise.resolve(
        new Response(JSON.stringify({
          source: mockStudy,
          similars: [{
            id: 2,
            titleStudy: 'Similar Study Title'
          }]
        }))
      ))
      global.fetch = fetchMock as any;

      const enLanguage = languageMap.get("en") as Language;

      // Mock Redux store.
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        }
      });

      const action = updateStudy("1");

      const promise = store.dispatch(action);

      expect(fetch).toHaveBeenCalledWith(`${window.location.origin}/api/sk/_get/${enLanguage.index}/${encodeURIComponent(mockStudy.id)}`);

      await promise;

      expect(store.getActions()).toEqual([
        {
          type: UPDATE_STUDY,
          displayed: getStudyModel(mockStudy),
          similars: [
            {
              id: 2,
              titleStudy: 'Similar Study Title'
            }
          ]
        }
      ]);
    });

    it('returns a list of alternative languages when 404 occurs', async () => {
      const fetchMock = jest.fn();
      fetchMock.mockReturnValueOnce(Promise.resolve(
        new Response(JSON.stringify(Array.from(languageMap.keys())),
          {
            status: 404,
            statusText: "Not found"
          }
        ) 
      ));
      global.fetch = fetchMock as any;


      const enLanguage = languageMap.get("en") as Language;

      // Mock Redux store.
      const store = mockStore({
        language: {
          currentLanguage: enLanguage,
          list: languages
        }
      });

      const action = updateStudy("1");

      const promise = store.dispatch(action);

      expect(fetch).toHaveBeenCalledWith(`${window.location.origin}/api/sk/_get/${enLanguage.index}/${encodeURIComponent(mockStudy.id)}`);

      await promise;

      expect(store.getActions()).toEqual([
        {
          type: CLEAR_STUDY,
          languageAvailableIn: languages
        }
      ]);
    });
  });
});
