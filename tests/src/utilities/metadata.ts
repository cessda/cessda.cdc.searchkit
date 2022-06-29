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

import { getJsonLd, getStudyModel } from '../../../common/metadata';

describe('Metadata utilities', () => {
  describe('getStudyModel()', () => {
    it('should return a populated study model', () => {
      expect(
        getStudyModel({
          _source: {
            id: "1",
            titleStudy: 'Study Title',
            titleStudyHighlight: 'Study Title',
            abstract: 'Abstract',
            abstractShort: 'Abstract',
            abstractHighlight: 'Abstract',
            abstractHighlightShort: 'Abstract',
            classifications: [
              {
                id: 'UKDS1234',
                term: 'Term',
                vocab: 'Vocab',
                vocabUri: 'http://example.com'
              }
            ],
            creators: [
              'Jane Doe',
              'University of Essex',
              'John Smith (University of Essex)',
              'Joe Bloggs, University of Essex'
            ],
            code: 'UKDS',
            dataAccessFreeTexts: ['Data Access Free Texts'],
            dataCollectionFreeTexts: [],
            dataCollectionPeriodEnddate: '',
            dataCollectionPeriodStartdate: '2001',
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
              abbr: "UKDS",
              publisher: 'UK Data Service'
            },
            samplingProcedureFreeTexts: [
              'Sampling Procedure<script></script>'
            ],
            studyAreaCountries: [
              {
                abbr: 'EN',
                country: 'England',
                searchField: 'England'
              }
            ],
            studyNumber: 'UKDS1234',
            studyUrl: 'http://example.com',
            studyXmlSourceUrl: 'http://example.com',
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
            ]
          }
        })
      ).toEqual({
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
        code: 'UKDS',
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
        dataCollectionYear: undefined,
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
        samplingProcedureFreeTexts: [
          'Sampling Procedure'
        ],
        studyAreaCountries: [
          {
            abbr: 'EN',
            country: 'England',
            searchField: 'England'
          }
        ],
        studyNumber: 'UKDS1234',
        studyUrl: 'http://example.com',
        studyXmlSourceUrl: 'http://example.com',
        typeOfModeOfCollections: [
          {
            id: 'UKDS1234',
            term: 'Term',
            vocab: 'Vocab',
            vocabUri: 'http://example.com'
          }
        ],
        typeOfSamplingProcedures: [],
        typeOfTimeMethods: [
          {
            id: 'UKDS1234',
            term: 'Term',
            vocab: 'Vocab',
            vocabUri: 'http://example.com'
          }
        ],
        unitTypes: [
          {
            id: 'UKDS1234',
            term: 'Term',
            vocab: 'Vocab',
            vocabUri: 'http://example.com'
          }
        ]
      });
    });

    it('should return a study model with default values', () => {
      expect(
        // @ts-expect-error
        getStudyModel({ _source: {}  })
      ).toEqual({
        id: undefined,
        titleStudy: undefined,
        titleStudyHighlight: '',
        abstract: '',
        abstractShort: '',
        abstractHighlight: '',
        abstractHighlightShort: '',
        classifications: [],
        code: undefined,
        creators: [],
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
        typeOfSamplingProcedures: [],
        typeOfTimeMethods: [],
        unitTypes: []
      });
    });
  });

  describe('getJsonLd()', () => {
    it('should return generated JSON-LD schema with valid data', () => {
      expect(
        getJsonLd({
          id: '1',
          titleStudy: 'Study Title',
          titleStudyHighlight: '',
          abstract: 'Abstract',
          abstractHighlight: '',
          abstractShort: 'Abstract',
          abstractHighlightShort: '',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          creators: [
            'Jane Doe',
            'University of Essex',
            'John Smith (University of Essex)',
            'Joe Bloggs, University of Essex'
          ],
          code: 'UKDS',
          dataAccessFreeTexts: ['Data Access Free Texts'],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
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
            publisher:'UK Data Service'
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
          studyXmlSourceUrl: 'http://example.com',
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
          ]
        })
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        creator: [
          {
            '@type': 'Person',
            name: 'Jane Doe'
          },
          {
            '@type': 'Organization',
            name: 'University of Essex'
          },
          {
            '@type': 'Person',
            affiliation: {
              '@type': 'Organization',
              name: 'University of Essex'
            },
            name: 'John Smith'
          },
          {
            '@type': 'Person',
            affiliation: {
              '@type': 'Organization',
              name: 'University of Essex'
            },
            name: 'Joe Bloggs'
          }
        ],
        dateModified: '2001-01-01',
        datePublished: '2001-01-01',
        description: 'Abstract',
        identifier: 'UKDS1234 (UKDS)',
        keywords: ['Term'],
        license: ['Data Access Free Texts'],
        measurementTechnique: 'Term',
        name: 'Study Title',
        sameAs: 'http://example.com',
        spatialCoverage: 'England',
        temporalCoverage: '2001/',
        url: undefined,
        variableMeasured: 'Term'
      });
    });

    it('should return generated JSON-LD schema with default values', () => {
      expect(
        getJsonLd({
          id: '1',
          titleStudy: 'Study Title',
          titleStudyHighlight: '',
          abstract: 'Abstract',
          abstractHighlight: '',
          abstractShort: 'Abstract',
          abstractHighlightShort: '',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          creators: [
            'Jane Doe',
            'University of Essex',
            'John Smith (University of Essex)',
            'Joe Bloggs, University of Essex'
          ],
          code: 'UKDS',
          dataAccessFreeTexts: [],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
          fileLanguages: ['en'],
          keywords: [],
          langAvailableIn: ['EN'],
          lastModified: '2001-01-01T12:00:00Z',
          pidStudies: [],
          publicationYear: '2001-01-01',
          publisher: {
            abbr: 'UKDS',
            publisher: 'UK Data Service',
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
          studyXmlSourceUrl: 'http://example.com',
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
          ]
        })
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        creator: [
          {
            '@type': 'Person',
            name: 'Jane Doe'
          },
          {
            '@type': 'Organization',
            name: 'University of Essex'
          },
          {
            '@type': 'Person',
            affiliation: {
              '@type': 'Organization',
              name: 'University of Essex'
            },
            name: 'John Smith'
          },
          {
            '@type': 'Person',
            affiliation: {
              '@type': 'Organization',
              name: 'University of Essex'
            },
            name: 'Joe Bloggs'
          }
        ],
        dateModified: '2001-01-01',
        datePublished: '2001-01-01',
        description: 'Abstract',
        identifier: '',
        keywords: [],
        license: [],
        measurementTechnique: 'Term',
        name: 'Study Title',
        sameAs: 'http://example.com',
        spatialCoverage: 'England',
        temporalCoverage: '2001/',
        url: undefined,
        variableMeasured: 'Term'
      });
    });
  });
});