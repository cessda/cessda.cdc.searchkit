/** @jest-environment node */
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

import Elasticsearch from "../../server/elasticsearch";
import { mockStudy } from "../common/mockdata"

// Mock Client() in elasticsearch module.
jest.mock('@elastic/elasticsearch', () => ({
  Client: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({
      _source: mockStudy,
      _index: 'cmmstudy_en'
    })),
    search: jest.fn(() => Promise.resolve({
      aggregations: {
        unique_id: {
          value: 1
        }
      },
      hits: {
        hits: [
          {
            _source: mockStudy,
            _index: 'cmmstudy_en'
          },
          {
            _source: undefined
          }
        ]
      }
    }))
  }))
}));



describe('elasticsearch utilities', () => {

  describe('getStudy()', () => {
    it('should get a study', async () => {
      const es = new Elasticsearch("test", undefined);
      await expect(es.getStudy(mockStudy.id, "cmmstudy_en")).resolves.toBe(mockStudy);
    });
  });

  describe('getSimilars()', () => {
    it('should return an array of similars', async () => {
      const es = new Elasticsearch("test");
      await expect(es.getSimilars(mockStudy.titleStudy, mockStudy.id, "cmmstudy_en"))
        .resolves.toStrictEqual([{
          id: mockStudy.id,
          title: mockStudy.titleStudy
        }]);

      // Expect the correct call to have beem made
      expect(es.client.search).toBeCalledWith({
        size: 5,
        index: "cmmstudy_en",
        query: { 
          bool: {
            must: {
              match: {
                titleStudy: 'Study Title'
              }
            },
            must_not: {
              ids: {
                values: ['1']
              }
            }
          }
        }
      });
    });
  });

  describe('getStudyFieldAllIndices()', () => {
    it('should return values for requested study field along with their index', async () => {
      const es = new Elasticsearch("test");
      await expect(es.getStudyFieldAllIndices(mockStudy.id, "relatedPublications"))
        .resolves.toStrictEqual([
          {
            values: [{
              title: "Related Publication 1",
              holdings: [
                "First Holding"
              ]
            }],
            index: 'cmmstudy_en'
          },
          {
            values: undefined,
            index: undefined
          }
        ]);
    });
  });

  describe('getTotalStudies()', () => {
    it('should return the total amount of studies', async () => {
      const es = new Elasticsearch("test");
      await expect(es.getTotalStudies()).resolves.toBe(1);
    });
  });
});
