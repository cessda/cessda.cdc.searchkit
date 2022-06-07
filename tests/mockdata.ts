import { CMMStudy } from "../common/metadata";
import { Language } from "../src/utilities/language";

export const mockStudy: CMMStudy = {
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
};

export const enLanguage: Language = {
  code: 'en',
  label: 'English',
  index: 'cmmstudy_en'
}
