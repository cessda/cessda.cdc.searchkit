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

import striptags from 'striptags';
import { Dataset, Organization, Person, WithContext } from 'schema-dts';
import { truncate, upperFirst } from 'lodash';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';

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
  /** Data access url */
  dataAccessUrl?: string;
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
  abstractLong: string;
  abstractHighlight: string;
  abstractHighlightShort: string;
  abstractHighlightLong: string;
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
  /** Universe */
  universe?: Universe;
  /** Related publications */
  relatedPublications: RelatedPublication[];
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

export interface RelatedPublication {
  title: string;
  holdings: string[];
  lang?: string;
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

export interface Universe {
  inclusion: string;
  exclusion?: string;
}

/**
 * Creates a model to store/display study metadata in the user interface.
 *
 * The comments indicate the label displayed in the UI for each property (it is not always obvious).
 */
export function getStudyModel(source: Partial<CMMStudy> | undefined, highlight?: SearchHit["highlight"]): CMMStudy {
  if (typeof(source) !== "object") {
    throw TypeError("_source is not an object");
  }
  return ({
    id: source.id as string,
    titleStudy: source.titleStudy as string,
    titleStudyHighlight: highlight?.titleStudy ? stripHTMLElements(highlight.titleStudy.join()) : '',
    code: source.code as string,
    creators: source.creators || [],
    pidStudies: source.pidStudies || [],
    abstract: stripHTMLElements(source.abstract as string),
    abstractShort: truncateAbstract(striptags(source.abstract as string), 380),
    abstractLong: truncateAbstract(striptags(source.abstract as string), 2000),
    abstractHighlight: highlight?.abstract ? stripHTMLElements(highlight.abstract.join()) : '',
    abstractHighlightShort: highlight?.abstract ? truncateAbstract(striptags(highlight.abstract.join()), 380) : '',
    abstractHighlightLong: highlight?.abstract ? truncateAbstract(striptags(highlight.abstract.join()), 2000) : '',
    studyAreaCountries: source.studyAreaCountries || [],
    typeOfTimeMethods: source.typeOfTimeMethods || [],
    unitTypes: source.unitTypes || [],
    typeOfSamplingProcedures: source.typeOfSamplingProcedures || [],
    samplingProcedureFreeTexts: (source.samplingProcedureFreeTexts || []).map(text => stripHTMLElements(text)),
    typeOfModeOfCollections: source.typeOfModeOfCollections || [],
    dataCollectionPeriodStartdate: source.dataCollectionPeriodStartdate || '',
    dataCollectionPeriodEnddate: source.dataCollectionPeriodEnddate || '',
    dataCollectionFreeTexts: source.dataCollectionFreeTexts || [],
    dataCollectionYear: source.dataCollectionYear,
    fileLanguages: source.fileLanguages || [],
    publisher: source.publisher as Publisher,
    publicationYear: source.publicationYear || '',
    dataAccessFreeTexts: (source.dataAccessFreeTexts || []).map(text => stripHTMLElements(text)),
    dataAccessUrl: source.dataAccessUrl,
    studyNumber: source.studyNumber || '',
    classifications: source.classifications || [],
    keywords: source.keywords || [],
    lastModified: source.lastModified || '',
    studyUrl: source.studyUrl,
    studyXmlSourceUrl: source.studyXmlSourceUrl as string,
    langAvailableIn: (source.langAvailableIn || []).map(i => i.toUpperCase()).sort(),
    universe: source.universe,
    relatedPublications: source.relatedPublications || []
  });
}

function truncateAbstract(string: string, limit: number): string {
  const trimmedString = string.trim();
  return truncate(trimmedString, { length: limit, separator: ' ' } );
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

  //Prioritize identifier
  const identifier = data.pidStudies.filter(i=> i.agency==='DOI').length !==0 ? data.pidStudies.filter(i=> i.agency==='DOI').map(i => i.pid)[0]
                   : data.pidStudies.filter(i=> i.agency==='Handle').length !==0 ? data.pidStudies.filter(i=> i.agency==='Handle').map(i => i.pid)[0]
                   : data.pidStudies.filter(i=> i.agency==='URN').length !==0 ? data.pidStudies.filter(i=> i.agency==='URN').map(i => i.pid)[0]
                   : data.pidStudies.filter(i=> i.agency==='ARK').length !==0 ? data.pidStudies.filter(i=> i.agency==='ARK').map(i => i.pid)[0]
                   : data.pidStudies.filter(i=> i.agency).map(i => i.pid)[0];

  // License
  let license: string | undefined = undefined;

  for (let i = 0; i < data.dataAccessFreeTexts.length; i++) {
    // Attempt to parse as a URL, select the first one
    try {
      license = new URL(data.dataAccessFreeTexts[i]).toString();
      break;
    } catch (e) {
      // invalid URLs should be ignored
    }
  }



  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: data.titleStudy,
    description: truncate(data.abstract, { length: 5000, separator: ' ' }),
    url: href, // Needs to generate a URL if href is undefined
    sameAs: data.studyUrl,
    keywords: data.keywords.map(i => upperFirst(i.term)),
    variableMeasured: data.unitTypes.map(u => u.term).join(', '),
    measurementTechnique: data.typeOfModeOfCollections.map(t => t.term).join(', '),
    license: license,
    identifier: identifier,
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

