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
    'Jane Doe',
    'University of Essex',
    'John Smith (University of Essex)',
    'Joe Bloggs, University of Essex'
  ],
  code: 'UKDS',
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
  fileLanguages: ['en'],
  funding: [
    {
      grantNumber: '123456',
      agency: 'Some Agency'
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
      ]
    }
  ],
  samplingProcedureFreeTexts: [
    "Sampling Procedure 1",
    "Sampling Procedure 2"
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
