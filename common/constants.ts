// Copyright CESSDA ERIC 2017-2026
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

export const BASE_INDEX = "cmmstudy_en" as const;

export const DEFAULT_HITS_PER_PAGE = 30 as const;

export const HITS_OPTIONS = [
  { value: 10, label: 'Show 10' },
  { value: DEFAULT_HITS_PER_PAGE, label: `Show ${DEFAULT_HITS_PER_PAGE}`, default: true },
  { value: 50, label: 'Show 50' },
  { value: 150, label: 'Show 150' },
];

export const SORT_OPTIONS = [
  { suffix: "", i18nKey: "sorting.relevance" },
  { suffix: "_title_asc", i18nKey: "sorting.titleAscending" },
  { suffix: "_title_desc", i18nKey: "sorting.titleDescending" },
  { suffix: "_collection_date_desc", i18nKey: "sorting.dateDescending" },
  { suffix: "_collection_date_asc", i18nKey: "sorting.dateAscending" },
  { suffix: "_publication_year_desc", i18nKey: "sorting.publicationDateDescending" },
  { suffix: "_publication_year_asc", i18nKey: "sorting.publicationDateAscending" },
] as const;
