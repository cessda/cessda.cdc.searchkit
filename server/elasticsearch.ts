// Copyright CESSDA ERIC 2017-2025
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

import { Client, ClientOptions } from '@elastic/elasticsearch'
import { estypes } from "@elastic/elasticsearch";
import _ from "lodash";
import { CMMStudy, Metrics } from "../common/metadata";
import { logger } from "./logger";

export default class Elasticsearch {
  private readonly indexName = "cmmstudy";

  public readonly client: Client;

  constructor(url: string, authentication?: ClientOptions["auth"]) {
    //Create ElasticSearch Client
    this.client = new Client({
      node: url,
      auth: authentication
    });

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
      index: index,
    });

    return response._source;
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
      query: Elasticsearch.similarQuery(id, title),
    });

    const sources = response.hits.hits.map(hit => hit._source);

    return _.compact(sources).map(value => ({
      id: value.id,
      title: value.titleStudy,
    }));
  }

  /**
   * Gets related publications from all indices for one study (except currently selected since they are already included).
   * @param id the identifier of the study.
   * @param sizeMax max number of related publications.
   * @param index exclude results from given index and use first part of name to query from all others with the same name.
   */
  async getRelatedPublications(id: string, sizeMax: number, index: string) {
    const boolQuery: estypes.QueryDslBoolQuery = {
      must: [
        {
          match: {
            _id: id
          }
        }
      ],
      must_not: [
        {
          term: {
            _index: index
          }
        }
      ]
    }

    const response = await this.client.search<CMMStudy>({
      size: sizeMax,
      _source: ['relatedPublications'],
      index: `${index.split('_')[0]}_*`,
      query: {
        bool: boolQuery
      }
    });

    if (!response.hits.hits) {
        return [];
    }

    return response.hits.hits.flatMap(hit => {
        return (hit._source?.relatedPublications || []).map(publication => ({
            title: publication.title,
            holdings: publication.holdings,
            publicationDate: publication.publicationDate,
            // Add lang according to the language part of index name
            lang: hit._index.split('_')[1]
        }));
    });
  }

  async getTotalStudies() {
    const response = await this.client.search({
      size: 0,
      index: `${this.indexName}_*`,
      query: { match_all: {} },
      aggs: {
        unique_id: {
          cardinality: {
            field: "id"
          }
        }
      }
    });

    // Assert the type as AggregationsCardinalityAggregate, then return the value
    return (response.aggregations?.unique_id as estypes.AggregationsCardinalityAggregate).value;
  }

  /**
   * Gets metrics for About page.
   * 
   * @param index the index to retrieve the metrics from. Defaults to cmmstudy if not given.
   */
  async getAboutMetrics(index = `${this.indexName}_*`): Promise<Metrics> {
    const response = await this.client.search<unknown, { 
      unique_id: estypes.AggregationsCardinalityAggregate, 
      total_creators: estypes.AggregationsNestedAggregate & {
        unique_creators: estypes.AggregationsCardinalityAggregate;
      },
      total_countries: estypes.AggregationsNestedAggregate & {
        unique_countries: estypes.AggregationsCardinalityAggregate;
      }
    }>({
      size: 0,
      index: index,
      query: { match_all: {} },
      aggs: {
        unique_id: {
          cardinality: {
            field: "id",
          },
        },
        total_creators: {
          nested: {
            path: "creators"
          },
          aggs: {
            unique_creators: {
              cardinality: {
                field: 'creators.name.normalized'
              }
            }
          }
        },
        total_countries: {
          nested: {
            path: "studyAreaCountries"
          },
          aggs: {
            unique_countries: {
              cardinality: {
                field: 'studyAreaCountries.abbr'
              }
            }
          }
        }
      },
    });

    const totalStudies = response.aggregations?.unique_id.value || 0;
    const totalCreators = response.aggregations?.total_creators.unique_creators?.value || 0;
    const totalCountries = response.aggregations?.total_countries.unique_countries?.value || 0;
  
    return {studies: totalStudies, creators: totalCreators, countries: totalCountries};
  }
  

  async getListOfMetadataLanguages() {
    const res = await this.client.indices.get({
      allow_no_indices: true,
      index: `${this.indexName}_*`
    });
    const indices = Object.keys(res);

    // Index names are of the form name_${lang}, extract the ${lang} part
    return indices.map(i => i.split("_")[1]);
  }

  async getSourceRepositoryNames() {
    const res = await this.client.search({
      size: 0,
      aggs: {
        publishers: {
          nested: {
            path: "publisherFilter"
          },
          aggs: {
            publisher: {
              terms: {
                field: "publisherFilter.publisher",
                order: { _key: "asc" },
                size: 30
              }
            }
          }
        }
      }
    });

    // Unwrap the aggregations
    const aggregation = res.aggregations?.publishers as estypes.AggregationsNestedAggregate;
    const publisherBuckets = (aggregation.publisher as estypes.AggregationsStringTermsAggregate).buckets;

    if (Array.isArray(publisherBuckets)) {
      return publisherBuckets.map(b => b.key);
    } else {
      return [];
    }
  }

  async getListOfCountries() {
    const res = await this.client.search({
      size: 0,
      aggs: {
        studyAreaCountries: {
          nested: {
            path: "studyAreaCountries"
          },
          aggs: {
            country: {
              terms: {
                field: "studyAreaCountries.searchField",
                order: { _key: "asc" },
                size: 1000
              }
            }
          }
        }
      }
    });

    // Unwrap the aggregations
    const aggregation = res.aggregations?.studyAreaCountries as estypes.AggregationsNestedAggregate;
    const countryBuckets = (aggregation.country as estypes.AggregationsStringTermsAggregate).buckets;

    if (Array.isArray(countryBuckets)) {
      return countryBuckets.map(b => b.key);
    } else {
      return [];
    }
  }

  //used for API documentation
  async getListOfTopics() {
    const res = await this.client.search({
      size: 0,
      aggs: {
        classifications: {
          nested: {
            path: "classifications"
          },
          aggs: {
            term: {
              terms: {
                field: "classifications.term",
                order: { _key: "asc" },
                size: 1000
              }
            }
          }
        }
      }
    });

    // Unwrap the aggregations
    const aggregation = res.aggregations?.classifications as estypes.AggregationsNestedAggregate;
    const topicBuckets = (aggregation.term as estypes.AggregationsStringTermsAggregate).buckets;

    if (Array.isArray(topicBuckets)) {
      return topicBuckets.map(b => b.key);
    } else {
      return [];
    }
  }

  /**
   * Queries Elasticsearch for the indices where a study ID is present
   * @param id the study ID
   * @returns the index names
   */
  async getIndicesForStudyId(id: string, indexPrefix?: string) {
    const res = await this.client.search({
      query: {
        ids: {
          values: [id],
        },
      },
      _source: false,
    });

    // Filter out indices that do not share the common prefix with the provided index
    if(indexPrefix){
      const indices = res.hits.hits.map(hit => hit._index);
      return indices.filter(index => index.startsWith(indexPrefix));
    } else {
      return res.hits.hits.map(hit => hit._index);
    }
  }

  /**
   * Get the amount of records per OAI-PMH endpoint from Elasticsearch.
   */
  async getEndpoints() {
    const res = await this.client.search<unknown>({
      aggs: {
        aggregationResults: {
          terms: {
            field: "code",
            size: 100
          }
        }
      },
      track_total_hits: false
    });
    const elasticAggs = res.aggregations?.aggregationResults as estypes.AggregationsStringTermsAggregate;
    const buckets = elasticAggs.buckets;
    if (Array.isArray(buckets)) {
      return buckets;
    } else {
      return [];
    }
  }

  /**
   * Get the amount of records in the specified language from Elasticsearch.
   * @param lang the language of the records.
   */
  async getRecordCountByLanguage(lang: string): Promise<number | undefined>{
    const response = await this.client.search({
      index: `${this.indexName}_${lang}`,
      track_total_hits: true
    });
    return Elasticsearch.parseTotalHits(response.hits.total);
  }

  /**
   * Extract the total hits from the hits metadata.
   * @returns the total hits, or undefined if not present.
   */
  static parseTotalHits(totalHits: estypes.SearchHitsMetadata["total"]) {
    // Calculate the total hits
    switch (typeof totalHits) {
      case "object":
        // If SearchTotalHits object, extract from the value field
        return totalHits.value;
      case "number":
        // If number, extract directly
        return totalHits;
      default:
        // Total hits not present, return undefined
        return undefined;
    }
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
