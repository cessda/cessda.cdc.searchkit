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

import { Client } from '@elastic/elasticsearch'
import { Client as NewTypes, ClientOptions } from '@elastic/elasticsearch/api/new'
import { AggregationsCardinalityAggregate } from "@elastic/elasticsearch/api/types";
import _ from "lodash";
import { CMMStudy } from "../common/metadata";
import { logger } from "./logger";


export default class Elasticsearch {
  public readonly client: NewTypes;

  constructor(url: string, authentication?: ClientOptions["auth"]) {
    //Create ElasticSearch Client
    this.client = new Client({
      node: url,
      auth: authentication
    }) as unknown as NewTypes;

    logger.info('Elasticsearch client configured');
  }

  /**
   * Gets a study with the specified identifier from the specified index.
   * @param id the id of the study.
   * @param index the index to retrieve the study from.
   * @returns the source of the study.
   */
  public async getStudy(id: string, index: string) {
    const response = await this.client.get<Partial<CMMStudy>>({
      id: id,
      index: index
    });

    return response.body._source;
  }

  /**
   * Gets similar studies based on the title of the study.
   * @param title the title of the study.
   * @param id the identifier of the study, used to exclude the study from the similars query.
   * @param index the index to retrieve the similars from.
   */
  async getSimilars(title: string, id: string, index: string) {
    const response = await this.client.search<CMMStudy>({
      size: 5,
      index: index,
      body: {
        query: Elasticsearch.similarQuery(id, title)
      }
    });

    const sources = response.body.hits.hits.map(hit => hit._source);

    return _.compact(sources).map(s => ({
      id: s.id,
      title: s.titleStudy
    }));
  }

  async getTotalStudies() {
    const response = await this.client.search({
      size: 0,
      index: "cmmstudy_*",
      body: {
        query: { match_all: {} },
        aggs: { 
          unique_id: {
            cardinality: {
              field: "id"
            }
          }
        }
      }
    });

    // Assert the type as AggregationsCardinalityAggregate, then return the value
    return (response.body.aggregations!.unique_id as AggregationsCardinalityAggregate).value;
  }

  /**
   * Query used to retrieve similar records for a specific title (for detail page).
   * @param id the document id, used to exclude the original document from the query.
   * @param title the title of the document to retrieve similar records for.
   */
  private static similarQuery(id: string, title: string) {
    return {
      bool: {
        must: {
          match: {
            titleStudy: title
          }
        },
        must_not: {
          ids: {
            values: [id]
          }
        }
      }
    };
  }
}
