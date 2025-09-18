import { CMMStudy } from "../../common/metadata";

export const mockStudy: CMMStudy = {
  id: '1',
  titleStudy: 'Study Title',
  titleStudyHighlight: '',
  abstract: 'This is a mock abstract describing a mock study.\n\nThe key results of this mock study is providing mock data that can be used to validate proper functionality of the application.',
  abstractHighlight: '',
  abstractShort: 'Abstract',
  abstractLong: 'Abstract',
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
  creators: [
    { name: 'Jane Doe' },
    { name: 'University of Essex' },
    { name: 'John Smith', affiliation: 'University of Essex', identifiers: [{ id: "0", type: "Test", uri: "http://localhost/0" }] },
    { name: 'Joe Bloggs, University of Essex' },
    { name: 'Matti Meikäläinen', identifiers: [{ id: "", type: "ORCID", uri: "http://localhost/0" }] },
    { name: 'Maija Meikäläinen', affiliation: 'Tampere University', identifiers: [{ id: "1" }] },
    { name: 'Mikko Meikäläinen', affiliation: 'Tampere University', identifiers: [
        { id: "0000-0000-0000-0000", type: "ORCID", uri: "https://orcid.org/0000-0000-0000-0000", role: "Pid" },
        { id: "000000000", type: "ROR", uri: "https://ror.org/000000000", role: "Affiliation-Pid" }
      ]
    },
  ],
  code: 'UKDS',
  dataAccess: 'Restricted',
  dataAccessFreeTexts: [
    "Data access terms and conditions"
  ],
  dataCollectionFreeTexts: [
    {
      dataCollectionFreeText: "Data collection texts",
      event: "Data collection event"
    }
  ],
  dataCollectionPeriodEnddate: '',
  dataCollectionPeriodStartdate: '2001',
  dataCollectionYear: 2001,
  dataKindFreeTexts: [
    { dataKindFreeText: "Software", },
    { dataKindFreeText: "Text", type: "Quantitative" },
    { dataKindFreeText: "Other" },
    { type: "Numeric" }
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
      id: '',
      term: 'Term',
      vocab: '',
      vocabUri: ''
    }
  ],
  langAvailableIn: ['EN'],
  lastModified: '2001-01-01T12:00:00Z',
  pidStudies: [
    {
      agency: "Example Agency",
      pid: "http://example.com",
    }
  ],
  publicationYear: '2001-01-01',
  publisher: {
    abbr: 'UKDS',
    publisher: 'UK Data Service',
  },
  relatedPublications: [
    {
      title: "Related Publication 1",
      holdings: [
        "First Holding"
      ],
      publicationDate: "2001"
    }
  ],
  samplingProcedureFreeTexts: [
    "Sampling Procedure 1",
    "Sampling Procedure 2"
  ],
  series: [
    { names: ['Series 1'], uris: ['http://example.com/1'], descriptions: ["Series 1 Description"] },
    { names: ['Series 2'], uris: ['http://example.com/2'], descriptions: ["Series 2 Description"] },
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
  typeOfSamplingProcedures: [
    {
      id: 'UKDS1234',
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
  universe: {
    inclusion: "Exampled studied cohort",
    exclusion: "Excluded cohort",
  }
};
