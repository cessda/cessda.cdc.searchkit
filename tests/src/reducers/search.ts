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

import { INIT_SEARCHKIT } from '../../../src/actions/search';
import search from '../../../src/reducers/search';
import { queryBuilder } from '../../../src/utilities/searchkit';

const initialState = search(undefined, { type: INIT_SEARCHKIT });

describe('Search reducer', () => {
  it('should return the initial state', () => {
    // @ts-expect-error
    expect(search(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle INIT_SEARCHKIT', () => {
    expect(
      search(
        initialState,
        {
          type: 'INIT_SEARCHKIT'
        }
      )
    ).toEqual(initialState);
  });

  it('should handle TOGGLE_LOADING', () => {
    expect(
      search(
        {
          ...initialState,
          loading: false
        },
        {
          type: 'TOGGLE_LOADING',
          loading: true
        }
      )
    ).toEqual({
      ...initialState,
      loading: true
    });
  });

  it('should handle TOGGLE_MOBILE_FILTERS', () => {
    expect(
      search(
        {
          ...initialState,
          showMobileFilters: false
        },
        {
          type: 'TOGGLE_MOBILE_FILTERS'
        }
      )
    ).toEqual({
      ...initialState,
      showMobileFilters: true
    });
  });

  it('should handle TOGGLE_ADVANCED_SEARCH', () => {
    expect(
      search(
        {
          ...initialState,
          showAdvancedSearch: false
        },
        {
          type: 'TOGGLE_ADVANCED_SEARCH'
        }
      )
    ).toEqual({
      ...initialState,
      showAdvancedSearch: true
    });
  });

  it('should handle TOGGLE_SUMMARY', () => {
    expect(
      search(
        {
          ...initialState,
          showFilterSummary: false
        },
        {
          type: 'TOGGLE_SUMMARY'
        }
      )
    ).toEqual({
      ...initialState,
      showFilterSummary: true
    });
  });

  it('should handle TOGGLE_METADATA_PANELS', () => {
    expect(
      search(
        {
          ...initialState,
          expandMetadataPanels: false
        },
        {
          type: 'TOGGLE_METADATA_PANELS'
        }
      )
    ).toEqual({
      ...initialState,
      expandMetadataPanels: true
    });
  });

  it('should handle UPDATE_DISPLAYED', () => {
    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: {
            hits: {
              hits: [],
              total: 0,
              max_score: 0
            }
          }
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [],
      jsonLd: undefined
    });

    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: {
            hits: {
              hits: [{
                //@ts-expect-error
                _source: {}
              }]
            }
          }
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [
        {
          id: undefined,
          titleStudy: undefined,
          titleStudyHighlight: '',
          abstract: '',
          abstractShort: '',
          abstractHighlight: '',
          abstractHighlightShort: '',
          classifications: [],
          creators: [],
          code: undefined,
          dataAccessFreeTexts: [],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '',
          dataCollectionYear: undefined,
          fileLanguages: [],
          keywords: [],
          langAvailableIn: [],
          lastModified: '',
          pidStudies: [],
          publicationYear: '',
          publisher: undefined,
          samplingProcedureFreeTexts: [],
          studyAreaCountries: [],
          studyNumber: '',
          studyUrl: undefined,
          studyXmlSourceUrl: undefined,
          typeOfModeOfCollections: [],
          typeOfTimeMethods: [],
          typeOfSamplingProcedures: [],
          unitTypes: [],
          universes: []
        }
      ]
    });

    expect(
      search(
        initialState,
        {
          type: 'UPDATE_DISPLAYED',
          displayed: {
            hits: {
              total: 1,
              max_score: 1,
              hits: [
                {
                  _id: "1",
                  _index: "cmmstudy_en",
                  _type: "cmmstudy",
                  _score: 1,
                  _source: {
                    id: "1",
                    titleStudy: 'Study Title',
                    studyNumber: 'UKDS1234',
                    abstract: 'Abstract',
                    abstractShort: '',
                    abstractHighlight: '',
                    abstractHighlightShort: '',
                    code: 'UKDS',
                    classifications: [
                      {
                        vocab: 'Vocab',
                        vocabUri: 'http://example.com',
                        id: 'UKDS1234',
                        term: 'Term'
                      }
                    ],
                    keywords: [
                      {
                        vocab: 'Vocab',
                        vocabUri: 'http://example.com',
                        id: 'UKDS1234',
                        term: 'Term'
                      }
                    ],
                    typeOfTimeMethods: [
                      {
                        vocab: 'Vocab',
                        vocabUri: 'http://example.com',
                        id: 'UKDS1234',
                        term: 'Term'
                      }
                    ],
                    studyAreaCountries: [
                      {
                        abbr: 'EN',
                        country: 'England',
                        searchField: 'England'
                      }
                    ],
                    unitTypes: [
                      {
                        vocab: 'Vocab',
                        vocabUri: 'http://example.com',
                        id: 'UKDS1234',
                        term: 'Term'
                      }
                    ],
                    publisher: {
                      abbr: 'UKDS',
                      publisher: 'UK Data Service'
                    },
                    publicationYear: '2001-01-01',
                    pidStudies: [
                      {
                        agency: 'UKDS',
                        pid: 'UKDS1234'
                      }
                    ],
                    fileLanguages: ['en'],
                    creators: [
                      'Jane Doe',
                      'University of Essex',
                      'John Smith (University of Essex)',
                      'Joe Bloggs, University of Essex'
                    ],
                    typeOfModeOfCollections: [
                      {
                        vocab: 'Vocab',
                        vocabUri: 'http://example.com',
                        id: 'UKDS1234',
                        term: 'Term'
                      }
                    ],
                    dataCollectionPeriodStartdate: '2001',
                    dataCollectionYear: 2001,
                    dataAccessFreeTexts: ['Data Access Free Texts'],
                    dataCollectionFreeTexts: [],
                    lastModified: '2001-01-01T12:00:00Z',
                    langAvailableIn: ['en'],
                    samplingProcedureFreeTexts: [],
                    studyUrl: 'http://example.com',
                    studyXmlSourceUrl: 'http://example.com/study',
                    titleStudyHighlight: '',
                    typeOfSamplingProcedures: [],
                    universes: []
                  }
                }
              ]
            }
          }
        }
      )
    ).toEqual({
      ...initialState,
      displayed: [
        {
          id: '1',
          titleStudy: 'Study Title',
          titleStudyHighlight: '',
          abstract: 'Abstract',
          abstractShort: 'Abstract',
          abstractHighlight: '',
          abstractHighlightShort: '',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          code: "UKDS",
          creators: [
            'Jane Doe',
            'University of Essex',
            'John Smith (University of Essex)',
            'Joe Bloggs, University of Essex'
          ],
          dataAccessFreeTexts: ['Data Access Free Texts'],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
          dataCollectionYear: 2001,
          fileLanguages: ['en'],
          keywords: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          langAvailableIn: ['EN'],
          lastModified: '2001-01-01T12:00:00Z',
          pidStudies: [
            {
              agency: 'UKDS',
              pid: 'UKDS1234'
            }
          ],
          publicationYear: '2001-01-01',
          publisher: {
            abbr: 'UKDS',
            publisher: 'UK Data Service'
          },
          samplingProcedureFreeTexts: [],
          studyAreaCountries: [
            {
              abbr: 'EN',
              country: 'England',
              searchField: 'England'
            }
          ],
          studyNumber: 'UKDS1234',
          studyUrl: 'http://example.com',
          studyXmlSourceUrl: "http://example.com/study",
          typeOfModeOfCollections: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          typeOfTimeMethods: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          typeOfSamplingProcedures: [],
          unitTypes: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          universes: []
        }
      ]
    });
  });

  it('should handle UPDATE_QUERY', () => {
    // Mock searchkit query.
    const query = {
      query: {
        bool: {
          must: [queryBuilder('search text')]
        }
      }
    };

    expect(
      search(
        {
          ...initialState,
          query: {}
        },
        {
          type: 'UPDATE_QUERY',
          query: query
        }
      )
    ).toEqual({
      ...initialState,
      query: query
    });
  });

  it('should handle UPDATE_STATE', () => {
    // Mock searchkit state.
    const state = {
      q: 'search text'
    };

    expect(
      search(
        {
          ...initialState,
          state: { q: '' }
        },
        {
          type: 'UPDATE_STATE',
          state: state
        }
      )
    ).toEqual({
      ...initialState,
      state: state
    });
  });

  it('should handle RESET_SEARCH', () => {
    const state = initialState;
    expect(
      search(state, {
        type: 'RESET_SEARCH'
      })
    ).toEqual(state);
  });

  it('should handle unknown action type', () => {
    const state = initialState;
    //@ts-expect-error
    expect(search(state, {})).toEqual(state);
  });
});
