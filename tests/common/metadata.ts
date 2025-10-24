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

import { getJsonLd, MetadataUtils } from '../../common/metadata';

describe('Metadata utilities', () => {
  describe('getStudyModel()', () => {
    it('should return a populated study model', () => {
      const metadataUtils = new MetadataUtils(new DOMParser());
      expect(
        metadataUtils.getStudyModel({
          id: "1",
          titleStudy: 'Study Title',
          titleStudyHighlight: 'Study Title',
          abstract: 'Abstract with link (<a href="http://example.com">Link text</a>)',
          abstractShort: 'Abstract',
          abstractLong: 'Abstract',
          abstractHighlight: 'Abstract',
          abstractHighlightShort: 'Abstract',
          abstractHighlightLong: 'Abstract',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          creators: [
            { name: 'Jane Doe' },
            { name: 'University of Essex' },
            { name: 'John Smith', affiliation: 'University of Essex', identifiers: [{ id: "0", type: "Test", uri: "http://localhost/0" }] },
            { name: 'Joe Bloggs, University of Essex' }
          ],
          code: 'UKDS',
          dataAccess: 'Restricted',
          dataAccessFreeTexts: ['Data Access Free Texts'],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
          dataKindFreeTexts: [
            { dataKindFreeText: "Numeric", type: "Quantitative" },
            { dataKindFreeText: "Text", type: "Quantitative" },
            { dataKindFreeText: "Other" },
          ],
          fileLanguages: ['en'],
          funding: [
            {
              grantNumber: '123456',
              agency: 'Some Agency'
            }
          ],
          generalDataFormats: [
            {
              id: '',
              term: 'Numeric',
              vocab: 'GeneralDataFormat',
              vocabUri: 'urn:ddi:int.ddi.cv:GeneralDataFormat:2.0.3'
            }
          ],
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
          series: [],
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
        id: '1',
        titleStudy: 'Study Title',
        titleStudyHighlight: '',
        abstract: 'Abstract with link (<a href="http://example.com/" target="_blank" rel="noopener noreferrer">Link text</a>)',
        abstractShort: 'Abstract with link (Link text)',
        abstractLong: 'Abstract with link (Link text)',
        abstractHighlight: '',
        abstractHighlightShort: '',
        abstractHighlightLong: '',
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
          { name: 'Jane Doe' },
          { name: 'University of Essex' },
          { name: 'John Smith', affiliation: 'University of Essex', identifiers: [{ id: "0", type: "Test", uri: "http://localhost/0" }] },
          { name: 'Joe Bloggs, University of Essex' }
        ],
        dataAccess: 'Restricted',
        dataAccessFreeTexts: ['Data Access Free Texts'],
        dataCollectionFreeTexts: [],
        dataCollectionPeriodEnddate: '',
        dataCollectionPeriodStartdate: '2001',
        dataCollectionYear: undefined,
        dataKindFreeTexts: [
          { dataKindFreeText: "Numeric", type: "Quantitative" },
          { dataKindFreeText: "Text", type: "Quantitative" },
          { dataKindFreeText: "Other" },
        ],
        fileLanguages: ['en'],
        funding: [
          {
            grantNumber: '123456',
            agency: 'Some Agency'
          }
        ],
        generalDataFormats: [
          {
            id: '',
            term: 'Numeric',
            vocab: 'GeneralDataFormat',
            vocabUri: 'urn:ddi:int.ddi.cv:GeneralDataFormat:2.0.3'
          }
        ],
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
        relatedPublications: [],
        samplingProcedureFreeTexts: [
          'Sampling Procedure'
        ],
        series: [],
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
        ],
        universe: undefined
      });
    });

    it('should return a study model with default values', () => {
      const metadataUtils = new MetadataUtils(new DOMParser());
      expect(
        metadataUtils.getStudyModel({})
      ).toEqual({
        id: undefined,
        titleStudy: undefined,
        titleStudyHighlight: '',
        abstract: '',
        abstractShort: '',
        abstractLong: '',
        abstractHighlight: '',
        abstractHighlightShort: '',
        abstractHighlightLong: '',
        classifications: [],
        code: undefined,
        creators: [],
        dataAccess: '',
        dataAccessFreeTexts: [],
        dataCollectionFreeTexts: [],
        dataCollectionPeriodEnddate: '',
        dataCollectionPeriodStartdate: '',
        dataCollectionYear: undefined,
        dataKindFreeTexts: [],
        fileLanguages: [],
        funding: [],
        generalDataFormats: [],
        keywords: [],
        langAvailableIn: [],
        lastModified: '',
        pidStudies: [],
        publicationYear: '',
        publisher: undefined,
        relatedPublications: [],
        samplingProcedureFreeTexts: [],
        series: [],
        studyAreaCountries: [],
        studyNumber: '',
        studyUrl: undefined,
        studyXmlSourceUrl: undefined,
        typeOfModeOfCollections: [],
        typeOfSamplingProcedures: [],
        typeOfTimeMethods: [],
        unitTypes: [],
        universe: undefined
      });
    });
  });

  it('should throw if an incorrect type is given', () => {
    expect(() => {
      const metadataUtils = new MetadataUtils(new DOMParser());
      metadataUtils.getStudyModel(undefined)
    }).toThrow(
      TypeError
    );
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
          abstractLong: 'Abstract',
          abstractHighlightLong: '',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          creators: [
            { name: 'Jane Doe' },
            { name: 'University of Essex' },
            { name: 'John Smith', affiliation: 'University of Essex', identifiers: [{ id: "0", type: "Test", uri: "http://localhost/0" }] },
            { name: 'Joe Bloggs, University of Essex' }
          ],
          code: 'UKDS',
          dataAccess: 'Restricted',
          dataAccessFreeTexts: ['Data Access Free Texts', 'https://creativecommons.org/licenses/by/4.0'],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
          dataKindFreeTexts: [],
          fileLanguages: ['en'],
          funding: [],
          generalDataFormats: [],
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
          relatedPublications: [],
          samplingProcedureFreeTexts: [],
          series: [],
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
          ],
          universe: {
            inclusion: "Included cohort"
          }
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
        identifier: 'UKDS1234',
        keywords: ['Term'],
        license: 'https://creativecommons.org/licenses/by/4.0',
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
          abstractLong: 'Abstract',
          abstractHighlightLong: '',
          classifications: [
            {
              id: 'UKDS1234',
              term: 'Term',
              vocab: 'Vocab',
              vocabUri: 'http://example.com'
            }
          ],
          creators: [
            { name: 'Jane Doe' },
            { name: 'University of Essex' },
            { name: 'John Smith', affiliation: 'University of Essex', identifiers: [{ id: "0", type: "Test", uri: "http://localhost/0" }] },
            { name: 'Joe Bloggs, University of Essex' }
          ],
          code: 'UKDS',
          dataAccess: 'Uncategorized',
          dataAccessFreeTexts: [],
          dataCollectionFreeTexts: [],
          dataCollectionPeriodEnddate: '',
          dataCollectionPeriodStartdate: '2001',
          dataKindFreeTexts: [],
          fileLanguages: ['en'],
          funding: [],
          generalDataFormats: [],
          keywords: [],
          langAvailableIn: ['EN'],
          lastModified: '2001-01-01T12:00:00Z',
          pidStudies: [],
          publicationYear: '2001-01-01',
          publisher: {
            abbr: 'UKDS',
            publisher: 'UK Data Service',
          },
          relatedPublications: [],
          samplingProcedureFreeTexts: [],
          series: [],
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
        identifier: undefined,
        keywords: [],
        license: undefined,
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
