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

import striptags from "striptags";
import { Dataset, Organization, Person, WithContext } from "schema-dts";
import { truncate, upperFirst } from "lodash";
import { estypes } from "@elastic/elasticsearch";

export interface CMMStudy {
  /** The internal ID of the study */
  id: string;
  code: string;
  /** Creator */
  creators: Creator[];
  /** Data collection start data */
  dataCollectionPeriodStartdate?: string;
  /** Data collection end date */
  dataCollectionPeriodEnddate?: string;
  /** Data collection year */
  dataCollectionYear?: number;
  /** Data collection free text */
  dataCollectionFreeTexts: DataCollectionFreeText[];
  /** Data access Open/Restricted/Uncategorized */
  dataAccess: string;
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
  /** Funding */
  funding: Funding[];
  /** Data kind free text */
  dataKindFreeTexts: DataKindFreeText[];
  /** General data format */
  generalDataFormats: TermVocabAttributes[];
  /** Series / Study group */
  series: Series[];
}

export interface Creator {
  name: string;
  affiliation?: string;
  identifiers?: Identifier[];
}

export interface Identifier {
  id: string;
  type?: string;
  uri?: string;
  role?: string;
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
  publicationDate: string;
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

export interface Funding {
  grantNumber?: string;
  agency?: string;
}

export interface DataKindFreeText {
  dataKindFreeText?: string;
  type?: string;
}

export interface Series {
  names?: string[];
  descriptions?: string[];
  uris?: string[];
}

export class MetadataUtils {
  
  private domParser: DOMParser;

  constructor(domParser: DOMParser) {
    this.domParser = domParser;
  }

  /**
   * Creates a model to store/display study metadata in the user interface.
   *
   * The comments indicate the label displayed in the UI for each property (it is not always obvious).
   */
  getStudyModel(source: Partial<CMMStudy> | undefined, highlight?: estypes.SearchHit["highlight"]): CMMStudy {
    if (typeof (source) !== "object") {
      throw TypeError("_source is not an object");
    }
    return ({
      id: source.id as string,
      titleStudy: source.titleStudy as string,
      titleStudyHighlight: highlight?.titleStudy ? this.stripHTMLElements(highlight.titleStudy.join()) : '',
      code: source.code as string,
      creators: source.creators || [],
      pidStudies: source.pidStudies || [],
      abstract: this.stripHTMLElements(source.abstract as string),
      abstractShort: this.truncateText(striptags(source.abstract as string), 380),
      abstractLong: this.truncateText(striptags(source.abstract as string), 2000),
      abstractHighlight: highlight?.abstract ? this.stripHTMLElements(highlight.abstract.join()) : '',
      abstractHighlightShort: highlight?.abstract ? this.truncateText(striptags(highlight.abstract.join()), 380) : '',
      abstractHighlightLong: highlight?.abstract ? this.truncateText(striptags(highlight.abstract.join()), 2000) : '',
      studyAreaCountries: source.studyAreaCountries || [],
      typeOfTimeMethods: source.typeOfTimeMethods || [],
      unitTypes: source.unitTypes || [],
      typeOfSamplingProcedures: source.typeOfSamplingProcedures || [],
      samplingProcedureFreeTexts: (source.samplingProcedureFreeTexts || []).map(text => this.stripHTMLElements(text)),
      typeOfModeOfCollections: source.typeOfModeOfCollections || [],
      dataCollectionPeriodStartdate: source.dataCollectionPeriodStartdate || '',
      dataCollectionPeriodEnddate: source.dataCollectionPeriodEnddate || '',
      dataCollectionFreeTexts: source.dataCollectionFreeTexts || [],
      dataCollectionYear: source.dataCollectionYear,
      fileLanguages: source.fileLanguages || [],
      publisher: source.publisher as Publisher,
      publicationYear: source.publicationYear || '',
      dataAccess: source.dataAccess || '',
      dataAccessFreeTexts: (source.dataAccessFreeTexts || []).map(text => this.stripHTMLElements(text)),
      dataAccessUrl: source.dataAccessUrl,
      studyNumber: source.studyNumber || '',
      classifications: source.classifications || [],
      keywords: source.keywords || [],
      lastModified: source.lastModified || '',
      studyUrl: source.studyUrl,
      studyXmlSourceUrl: source.studyXmlSourceUrl as string,
      langAvailableIn: (source.langAvailableIn || []).map(i => i.toUpperCase()).sort(),
      universe: source.universe,
      relatedPublications: source.relatedPublications || [],
      funding: source.funding || [],
      dataKindFreeTexts: source.dataKindFreeTexts || [],
      generalDataFormats: source.generalDataFormats || [],
      series: source.series || []
    });
  }

  truncateText(string: string, limit: number): string {
    const trimmedString = string.trim();
    return truncate(trimmedString, { length: limit, separator: ' ' });
  }

  /**
   * Strip non-styling HTML tags from the given HTML string
   * except hyperlinks which are sanitized instead.
   * @param {string} html the HTML to strip.
   */
  stripHTMLElements(html: string) {
    const strippedHTML = striptags(html, [
      "a",
      "p",
      "strong",
      "br",
      "em",
      "i",
      "s",
      "ol",
      "ul",
      "li",
      "b",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ]);

    return this.sanitizeAnchorTags(strippedHTML.trim());
  }

  /**
   * Sanitize &lt;a&gt; tags by setting target="_blank" and rel="noopener noreferrer".
   * All other attributes are removed.
   * 
   * @param html the HTML to sanitize.
   * @returns the sanitized HTML.
   */
  sanitizeAnchorTags(html: string): string {
    const parsedHTML = this.domParser.parseFromString(html, "text/html");

    // Get all <a> elements
    const anchorElements = parsedHTML.getElementsByTagName("a");

    for (const elem of anchorElements) {
      // Store the href
      const href = elem.href;

      // Clear other attributes
      for (const attr of elem.getAttributeNames()) {
        elem.removeAttribute(attr);
      }

      // Copy href
      elem.href = href;

      // Set target and rel attributes
      elem.target = "_blank";
      elem.rel = "noopener noreferrer";
    }

    return parsedHTML.body.innerHTML;
  }

  normalizeAndDecodeHTML(html: string) {
    if (html) {
      // Convert escaped HTML tags
      html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    // Strip non-styling elements from the HTML
    return this.stripHTMLElements(html);
  }
}

// Generates study JSON-LD for Google indexing.
export function getJsonLd(data: CMMStudy, href?: string): WithContext<Dataset> {
  // Attempt to split people from organisations in the creator field.
  const creators: Array<Organization | Person> = data.creators.map(creator => {
    // Explicitly stated affiliation
    if (creator.affiliation) {
      return {
        '@type': 'Person',
        name: creator.name,
        affiliation: {
          '@type': 'Organization',
          name: creator.affiliation
        }
      };
    }

    // Format: "Name, Organisation"
    const commaMatches = /([a-z0-9\x7f-\xff,. -]+),([a-z0-9\x7f-\xff,. -]+)/gi.exec(creator.name);
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

    const creatorLower = creator.name.toLowerCase();
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
      name: creator.name
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function extractDataCollectionPeriod(
  dataCollectionPeriodStartdate: string | undefined,
  dataCollectionPeriodEnddate: string | undefined
) {
  if (!dataCollectionPeriodStartdate) {
    return "";
  }

  const startDate = dataCollectionPeriodStartdate.substring(0, 10) + "/";

  if (!dataCollectionPeriodEnddate) {
    return startDate;
  }

  return startDate + dataCollectionPeriodEnddate.substring(0, 10);
}

// TODO: implement with DOM
export function getDDI(metadata: CMMStudy, lang: string): string {
  const {
    titleStudy, creators, dataCollectionPeriodStartdate, dataCollectionPeriodEnddate, dataCollectionYear,
    dataAccessFreeTexts, pidStudies, studyAreaCountries, typeOfModeOfCollections, typeOfTimeMethods,
    typeOfSamplingProcedures, universe, keywords, classifications, publicationYear, publisher, relatedPublications,
    abstract, studyUrl, funding, series, unitTypes, dataKindFreeTexts
  } = metadata;

  const createElement = (tag: string, content: string | undefined, attributes = {}) =>
  `<${tag}${Object.entries(attributes).map(([key, value]) => value ? ` ${key}="${value}"` : '').join('')}${content !== undefined ? `>${content}</${tag}>` : ' />'}`;

  function createElementWithConcept<T>(
    tag: string,
    items: T[],
    getContent: (item: T) => string
  ): string {
    return items
      .map(getContent)
      .filter(Boolean)
      .map(content => `<${tag} xml:lang="${lang}">${content}</${tag}>`)
      .join('');
  }

  const modeXML = createElementWithConcept('collMode', typeOfModeOfCollections, collMode =>
    `${collMode.term || collMode.id}${collMode.id ? `<concept vocab="${collMode.vocab}" vocabURI="${collMode.vocabUri}">${collMode.id}</concept>` : ''}`
  );

  const timeMethodXML = createElementWithConcept('timeMeth', typeOfTimeMethods, timeMeth =>
    `${timeMeth.term || timeMeth.id}${timeMeth.id ? `<concept vocab="${timeMeth.vocab}" vocabURI="${timeMeth.vocabUri}">${timeMeth.id}</concept>` : ''}`
  );

  const sampProcXML = createElementWithConcept('sampProc', typeOfSamplingProcedures, sampProc =>
    `${sampProc.id}${sampProc.id ? `<concept vocab="${sampProc.vocab}" vocabURI="${sampProc.vocabUri}">${sampProc.id}</concept>` : ''}`
  );

  const anlyUnitXML = createElementWithConcept('anlyUnit', unitTypes, anlyUnit =>
    `${anlyUnit.term || anlyUnit.id}${anlyUnit.id ? `<concept vocab="${anlyUnit.vocab}" vocabURI="${anlyUnit.vocabUri}">${anlyUnit.id}</concept>` : ''}`
  );

  const pidXML = pidStudies.map(pid => createElement('IDNo', pid.pid, {
    'xml:lang': lang,
    ...(pid.agency ? { 'agency': pid.agency } : {})
  })).join('\n');

  const authEntyXML = creators.map(creator => {
    const affiliationAttr = creator.affiliation ? ` affiliation="${creator.affiliation}"` : '';
    const extLinks = creator.identifiers?.map(identifier =>
      `<ExtLink URI="${identifier.uri}" role="PID" title="${identifier.type}" xml:lang="${lang}">${identifier.id}</ExtLink>`
    ).join('') || '';
    return `<AuthEnty xml:lang="${lang}"${affiliationAttr}>${creator.name}${extLinks}</AuthEnty>`;
  }).join('\n');

  const fundingXML = funding.map(funding => createElement('grantNo', funding.grantNumber || '', {
    'xml:lang': lang,
    ...(funding.agency ? { 'agency': funding.agency } : {})
  })).join('\n');

  const seriesXML = series.map(series =>
    `<serStmt${series.uris?.[0] ? ` URI="${series.uris[0]}"` : ''} xml:lang="${lang}">
      ${(series.names || []).map(name => `<serName xml:lang="${lang}">${name}</serName>`).join('')}
      ${(series.descriptions || []).map(desc => `<serInfo xml:lang="${lang}">${escapeTextInXml(desc)}</serInfo>`).join('')}
    </serStmt>`
  ).join('\n');

  const relatedPublicationXML = relatedPublications.map(pub =>
    `<relPubl xml:lang="${pub.lang || 'en'}">
      ${escapeTextInXml(pub.title)}
      <citation>
        ${(pub.holdings || []).map(holding => `<holdings xml:lang="${pub.lang || 'en'}" URI="${holding}"/>`).join('')}
      </citation>
    </relPubl>`
  ).join('\n');

  const ddiXML = `<?xml version="1.0" encoding="UTF-8"?>
<codeBook version="2.5" xmlns="ddi:codebook:2_5" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="ddi:codebook:2_5 http://www.ddialliance.org/Specification/DDI-Codebook/2.5/XMLSchema/codebook.xsd">
  <docDscr>
    <citation>
      <titlStmt>
        ${createElement('titl', titleStudy, { 'xml:lang': lang })}
      </titlStmt>
      <prodStmt>
        ${publisher.publisher ? createElement('producer', publisher.publisher, { 'xml:lang': lang, ...(publisher.abbr !== "Publisher not specified" && { abbr: publisher.abbr }) }) : ''}
      </prodStmt>
      ${createElement('holdings', '', {'xml:lang': lang, URI: studyUrl, location: `${publisher.publisher}${publisher.abbr !== "Publisher not specified" ? ' ' + publisher.abbr : ''}` })}
    </citation>
  </docDscr>
  <stdyDscr>
    <citation>
      <titlStmt>
        ${createElement('titl', titleStudy, { 'xml:lang': lang })}
        ${pidXML}
      </titlStmt>
      <rspStmt>
        ${authEntyXML}
      </rspStmt>
      <prodStmt>
        ${fundingXML}
      </prodStmt>
      <distStmt>
        ${publisher.publisher ? createElement('distrbtr', publisher.publisher, { 'xml:lang': lang, ...(publisher.abbr !== "Publisher not specified" && { abbr: publisher.abbr }) }) : ''}
        ${createElement('distDate', '', { 'xml:lang': lang, date: publicationYear })}
      </distStmt>
      ${seriesXML}
      ${createElement('holdings', '', {'xml:lang': lang, URI: studyUrl, location: `${publisher.publisher}${publisher.abbr !== "Publisher not specified" ? ' ' + publisher.abbr : ''}` })}
    </citation>
    <stdyInfo>
      <subject>
        ${keywords.map(keyword => createElement('keyword', keyword.term, { 'xml:lang': lang, vocab: keyword.vocab, vocabURI: keyword.vocabUri, ID: keyword.id })).join('')}
        ${classifications.map(topic => createElement('topcClas', topic.term, { 'xml:lang': lang, vocab: topic.vocab, vocabURI: topic.vocabUri, ID: topic.id })).join('')}
      </subject>
      ${createElement('abstract', escapeTextInXml(abstract), { 'xml:lang': lang })}
      <sumDscr>
        ${dataCollectionPeriodStartdate && dataCollectionPeriodEnddate ? `<collDate xml:lang="${lang}" date="${dataCollectionPeriodStartdate}" event="start"/><collDate xml:lang="${lang}" date="${dataCollectionPeriodEnddate}" event="end"/>` : ''}
        ${!(dataCollectionPeriodStartdate || dataCollectionPeriodEnddate) && dataCollectionYear ? `<collDate xml:lang="${lang}" date="${dataCollectionYear}" event="single"/>` : ''}
        ${studyAreaCountries.map(country => createElement('nation', country.country, { 'xml:lang': lang, abbr: country.abbr }))}
        ${studyAreaCountries.map(country => createElement('geogCover', country.country, { 'xml:lang': lang })).join('\n')}
        ${anlyUnitXML}
        ${universe?.inclusion ? `<universe xml:lang="${lang}" clusion="I">${universe.inclusion}</universe>` : ''}
        ${universe?.exclusion ? `<universe xml:lang="${lang}" clusion="E">${universe.exclusion}</universe>` : ''}
        ${dataKindFreeTexts.map(dataKind => createElement('dataKind', dataKind.dataKindFreeText, { 'xml:lang': lang })).join('\n')}
      </sumDscr>
    </stdyInfo>
    <method>
      ${timeMethodXML || sampProcXML || modeXML ? `<dataColl>${timeMethodXML}${sampProcXML}${modeXML}</dataColl>` : ''}
    </method>
    <dataAccs>
      ${dataAccessFreeTexts.length > 0 ? `<useStmt>${dataAccessFreeTexts.map(dataAccessTerms => createElement('restrctn', dataAccessTerms , { 'xml:lang': lang })).join('\n')}</useStmt>` : ''}
    </dataAccs>
    ${relatedPublicationXML ? `<othrStdyMat>${relatedPublicationXML}</othrStdyMat>` : ''}
  </stdyDscr>
</codeBook>`;

  return formatXML(ddiXML);
}

function formatXML(xml: string) {
  const PADDING = ' '.repeat(2); // Spaces for padding
  let formatted = '';
  const reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, '$1\n$2$3');
  let pad = 0;

  xml.split('\n').forEach((node) => {
    let indent = 0;
    if (node.match(/<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\w/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    const parts = node.match(/<[^>]*>|[^<]+/g) || []; // Split the node into parts: tags and text content
    let formattedNode = '';
    parts.forEach((part) => {
      if (part.startsWith('<')) {
        formattedNode += part; // Preserve XML tags
      } else {
        formattedNode += escapeTextInXml(part); // Escape text content
      }
    });

    formatted += PADDING.repeat(pad) + formattedNode + '\n';
    pad += indent;
  });

  return formatted.trim(); // Remove trailing whitespace
}

// Function to escape special characters within XML text content
function escapeTextInXml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TermURIResult extends Record<string, string> {}

/**
 * Study metrics shown on the about page
 */
export interface Metrics {
  studies: number;
  creators: number;
  countries: number;
}
