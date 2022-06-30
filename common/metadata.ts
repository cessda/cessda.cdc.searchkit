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

import striptags from 'striptags';
import { Dataset, Organization, Person, WithContext } from 'schema-dts';
import _ from 'lodash';
import { SearchHit } from '@elastic/elasticsearch/api/types';

export interface CMMStudy {
  /** The internal ID of the study */
  id: string;
  code: string;
  /** Creator */
  creators: string[];
  /** Data collection start data */
  dataCollectionPeriodStartdate?: string;
  /** Data collection end date */
  dataCollectionPeriodEnddate?: string;
  /** Data collection year */
  dataCollectionYear?: number;
  /** Data collection free text */
  dataCollectionFreeTexts: DataCollectionFreeText[];
  /** Terms of data access */
  dataAccessFreeTexts: string[];
  /** Publication year */
  publicationYear: string;
  /** Data collection mode */
  typeOfModeOfCollections: TermVocabAttributes[];
  /** Keywords */
  keywords: TermVocabAttributes[];
  /** Sampling procedure free text */
  samplingProcedureFreeTexts: string[];
  /** Topic classifications */
  classifications: TermVocabAttributes[];
  /** Abstract */
  abstract: string;
  abstractShort: string;
  abstractHighlight: string;
  abstractHighlightShort: string;
  /** Study title */
  titleStudy: string;
  titleStudyHighlight: string;
  studyUrl?: string;
  /** Study number */
  studyNumber: string;
  /** Time dimension */
  typeOfTimeMethods: TermVocabAttributes[];
  /** Language of data files */
  fileLanguages: string[];
  /** Sampling procedure */
  typeOfSamplingProcedures: VocabAttributes[];
  /** Publisher */
  publisher: Publisher;
  /** Country */
  studyAreaCountries: Country[];
  /** Analysis unit */
  unitTypes: TermVocabAttributes[];
  /** Study Persistent Identifier */
  pidStudies: Pid[];
  lastModified: string;
  langAvailableIn: string[];
  studyXmlSourceUrl: string;
}

export interface Country {
  abbr: string;
  country: string;
  searchField: string;
}

export interface DataCollectionFreeText {
  dataCollectionFreeText: string;
  event: string;
}

export interface Pid {
  agency: string;
  pid: string;
}

export interface Publisher {
  abbr: string;
  publisher: string;
}

export interface VocabAttributes {
  vocab: string;
  vocabUri: string;
  id: string;
}

export interface TermVocabAttributes extends VocabAttributes {
  term: string;
}

export interface Similar {
  id: string;
  title: string;
}

/** 
 * Creates a model to store/display study metadata in the user interface.
 * 
 * The comments indicate the label displayed in the UI for each property (it is not always obvious).
 */
export function getStudyModel(data: Pick<SearchHit<CMMStudy>, "_source" | "highlight">): CMMStudy {
  if (typeof(data._source) !== "object") {
    throw TypeError("_source is not an object");
  }
  return ({
    id: data._source.id,
    titleStudy: data._source.titleStudy,
    titleStudyHighlight: data.highlight?.titleStudy ? stripHTMLElements(data.highlight.titleStudy.join()) : '',
    code: data._source.code,
    creators: data._source.creators || [],
    pidStudies: data._source.pidStudies || [],
    abstract: stripHTMLElements(data._source.abstract),
    abstractShort: truncateAbstract(striptags(data._source.abstract)),
    abstractHighlight: data.highlight?.abstract ? stripHTMLElements(data.highlight.abstract.join()) : '',
    abstractHighlightShort: data.highlight?.abstract ? truncateAbstract(striptags(data.highlight.abstract.join())) : '',
    studyAreaCountries: data._source.studyAreaCountries || [],
    typeOfTimeMethods: data._source.typeOfTimeMethods || [],
    unitTypes: data._source.unitTypes || [],
    typeOfSamplingProcedures: data._source.typeOfSamplingProcedures || [],
    samplingProcedureFreeTexts: (data._source.samplingProcedureFreeTexts || []).map(text => stripHTMLElements(text)),
    typeOfModeOfCollections: data._source.typeOfModeOfCollections || [],
    dataCollectionPeriodStartdate: data._source.dataCollectionPeriodStartdate || '',
    dataCollectionPeriodEnddate: data._source.dataCollectionPeriodEnddate || '',
    dataCollectionFreeTexts: data._source.dataCollectionFreeTexts || [],
    dataCollectionYear: data._source.dataCollectionYear,
    fileLanguages: data._source.fileLanguages || [],
    publisher: data._source.publisher,
    publicationYear: data._source.publicationYear || '',
    dataAccessFreeTexts: (data._source.dataAccessFreeTexts || []).map(text => stripHTMLElements(text)),
    studyNumber: data._source.studyNumber || '',
    classifications: data._source.classifications || [],
    keywords: data._source.keywords || [],
    lastModified: data._source.lastModified || '',
    studyUrl: data._source.studyUrl,
    studyXmlSourceUrl: data._source.studyXmlSourceUrl,
    langAvailableIn: (data._source.langAvailableIn || []).map(i => i.toUpperCase()).sort()
  });
}

function truncateAbstract(string: string): string {
  const trimmedString = string.trim();
  return _.truncate(trimmedString, { length: 500 } );
}

/**
 * Strip non-styling HTML tags from the given HTML string.
 * @param {string} html the HTML to strip. 
 */
function stripHTMLElements(html: string) {
  const strippedHTML = striptags(html, ['p', 'strong', 'br', 'em', 'i', 's', 'ol', 'ul', 'li', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  return strippedHTML.trim();
}

/** Format: "Name (Organisation)" */
const bracketRegex = /([a-z0-9\x7f-\xff,. -]+) \(([a-z0-9\x7f-\xff,. -]+)\)/gi;
/** Format: "Name, Organisation" */
const commaRegex = /([a-z0-9\x7f-\xff,. -]+),([a-z0-9\x7f-\xff,. -]+)/gi;

// Generates study JSON-LD for Google indexing.
export function getJsonLd(data: CMMStudy, href?: string): WithContext<Dataset> {
  // Attempt to split people from organisations in the creator field.
  const creators: Array<Organization | Person> = data.creators.map(creator => {
    const bracketMatches = bracketRegex.exec(creator);
    if (bracketMatches) {
      return {
        '@type': 'Person',
        name: bracketMatches[1].trim(),
        affiliation: {
          '@type': 'Organization',
          name: bracketMatches[2].trim()
        }
      };
    }

    const commaMatches = commaRegex.exec(creator);
    if (commaMatches) {
      return {
        '@type': 'Person',
        name: commaMatches[1].trim(),
        affiliation: {
          '@type': 'Organization',
          name: commaMatches[2].trim()
        }
      };
    }
    
    const creatorLower = creator.toLowerCase();
    // Assume organisation if it contains any of the following words.
    return {
      '@type': creatorLower.includes('university') ||
               creatorLower.includes('institute') ||
               creatorLower.includes('polytechnic') ||
               creatorLower.includes('government') ||
               creatorLower.includes('department') ||
               creatorLower.includes('faculty') ||
               creatorLower.includes('division') ||
               creatorLower.includes('agency') ||
               creatorLower.includes('unit') ? 'Organization' : 'Person',
      name: creator.trim()
    }
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: data.titleStudy,
    description: data.abstract,
    url: href, // Needs to generate a URL if href is undefined
    sameAs: data.studyUrl,
    keywords: data.keywords.map(i => _.upperFirst(i.term)),
    variableMeasured: data.unitTypes.map(u => u.term).join(', '),
    measurementTechnique: data.typeOfModeOfCollections.map(t => t.term).join(', '),
    license: data.dataAccessFreeTexts,
    identifier: data.pidStudies.filter(i=> i.agency==='DOI').map(i => i.pid)[0],
    creator: creators,
    temporalCoverage: extractDataCollectionPeriod(data.dataCollectionPeriodStartdate, data.dataCollectionPeriodEnddate),
    spatialCoverage: data.studyAreaCountries.map(s => s.country).join(', '),
    datePublished: data.publicationYear.substring(0, 10),
    dateModified: data.lastModified.substring(0, 10)
  };
}

function extractDataCollectionPeriod(dataCollectionPeriodStartdate: string | undefined, dataCollectionPeriodEnddate: string | undefined) {

  if (!dataCollectionPeriodStartdate) {
    return '';
  }

  const startDate = dataCollectionPeriodStartdate.substring(0, 10) + '/';

  if (!dataCollectionPeriodEnddate) {
    return startDate;
  }

  return startDate + dataCollectionPeriodEnddate.substring(0, 10);
}

