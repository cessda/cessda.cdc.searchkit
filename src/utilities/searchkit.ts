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

import {SearchkitManager} from 'searchkit';

// Query builder used to create the query going to Elasticsearch (for search page).
export const queryBuilder = (query: string) => {
  return {
    simple_query_string: {
      query: query,
      lenient: true,
      default_operator: "AND",

      // Can limit to searching specific fields if required. Weightings can also be added.
      fields: [
        'titleStudy^4', 
        'abstract^2', 
        'creators^2', 
        'keywords.id^1.5', 
        '*' // Include all other fields at the default weighting
      ]
    }
  };
};

// Query used to retrieve a single record by its ID (for detail page).
export const detailQuery = (id: string) => {
  return {
    bool: {
      must: {
        match: {
          id: id
        }
      }
    }
  };
};

// Query used to retrieve a single record by its pid (for detail page).
export const pidQuery = (pid: string) => {
  return {
    nested:{
      path: "pidStudies",
      query: {
        bool: {
          must: {
            match: {
              "pidStudies.pid": pid
            }
          }
        }
      }
    }
  };
};

// Query used to retrieve similar records for a specific title (for detail page).
export const similarQuery = (title: string) => {
  return {
    bool: {
      must: {
        match: {
          titleStudy: title
        }
      }
    }
  };
};

// Match all query
export const matchAllQuery = () => {
  return {
    match_all: {}
  };
};

// Aggregation used to get the total number of unique records
export const uniqueAggregation = () => {
  return {
    unique_id: {
      cardinality: {
        field: "id"
      }
    }
  };
};

// Define a single searchkit manager instance to power the application.
const searchkit: SearchkitManager = new SearchkitManager('/api/sk');

export default searchkit;
