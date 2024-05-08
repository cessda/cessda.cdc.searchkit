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

import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import {SearchkitManager} from 'searchkit';

/**
 * Query builder used to create the query going to Elasticsearch (for search page).
 */
export function queryBuilder(query: string): QueryDslQueryContainer {
  return {
    simple_query_string: {
      query: query,
      lenient: true,
      default_operator: "AND",

      // #453: Use only the operators that are documented, as other operators can result in unexpected behavior
      flags: "AND|OR|NOT|PHRASE|PRECEDENCE|PREFIX",

      // Can limit to searching specific fields if required. Weightings can also be added.
      fields: [
        'titleStudy^4',
        'abstract^2',
        'creators^2',
        'keywords.term^1.5',
        '*' // Include all other fields at the default weighting
      ]
    }
  };
}

/**
 * Query used to retrieve a single record by its ID (for detail page).
 * @param id the document to retrieve.
 */
export function detailQuery(id: string): QueryDslQueryContainer {
  return {
    ids: {
      values: [id]
    }
  };
}

/**
 * Query used to retrieve a single record by its pid (for detail page).
 */
export function pidQuery(pid: string): QueryDslQueryContainer {
  return {
    bool: {
      must: {
        match: {
          pidStudies: pid
        }
      }
    }
  };
}

/**
 * Match all query
 */
export function matchAllQuery(): QueryDslQueryContainer {
  return {
    match_all: {}
  };
}

// Define a single searchkit manager instance to power the application.
const searchkit: SearchkitManager = new SearchkitManager('/api/sk', {
  // Avoid timing out searches on slow connections.
  timeout: 2147483647 // Largest supported timeout.
});

export default searchkit;
