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

import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { truncate, upperFirst } from "lodash";
import {
  CMMStudy,
  Creator,
  DataCollectionFreeText,
  DataKindFreeText,
  getDDI,
  Identifier,
  TermVocabAttributes,
  Universe,
} from "../../common/metadata";
import {
  ChronoField,
  DateTimeFormatter,
  DateTimeFormatterBuilder,
} from "@js-joda/core";
import { FaAngleDown, FaAngleUp, FaCode, FaExternalLinkAlt } from "react-icons/fa";
import striptags from "striptags";
import { useTranslation } from "react-i18next";
import Tooltip from "./Tooltip";
import { HeadingEntry } from "../containers/DetailPage";
import Select from 'react-select';
import { useAppDispatch, useAppSelector } from "../hooks";
import Keywords from "./Keywords";
import SeriesList from './SeriesList';
import { OrcidLogo, RorLogo } from "./PidLogos";
import { Helmet } from "react-helmet-async";
import { toggleAllFields } from "../reducers/detail";

export interface Props {
  item: CMMStudy;
  headings: HeadingEntry[];
}

export interface State {
  abstractExpanded: boolean;
  keywordsExpanded: boolean;
}

interface Option {
  value: string;
  label: string;
}



const Detail = (props: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);
  const showAllFields = useAppSelector((state) => state.detail.showAllFields);

  const item = props.item;
  const headings = props.headings;
  const truncatedAbstractLength = 2000;
  const abstractWithoutTags = striptags(item.abstract).trim();


  const [abstractExpanded, setAbstractExpanded] = useState(item.abstract.length <= truncatedAbstractLength || abstractWithoutTags === item.abstractLong);
  const exportMetadataOptions: Option[] = [
    { value: 'json', label: 'JSON' },
    { value: 'ddi25', label: 'DDI-C 2.5' }
  ]
  const [selectedExportMetadataOption, setSelectedExportMetadataOption] = useState<Option | null>(exportMetadataOptions[0]);

  const formatter = new DateTimeFormatterBuilder()
    .appendValue(ChronoField.YEAR)
    .optionalStart()
    .appendLiteral("-")
    .appendValue(ChronoField.MONTH_OF_YEAR)
    .optionalStart()
    .appendLiteral("-")
    .appendValue(ChronoField.DAY_OF_MONTH)
    .optionalStart()
    .appendLiteral("T")
    .append(DateTimeFormatter.ISO_OFFSET_TIME)
    .toFormatter();

  const dateFormatter = DateTimeFormatter.ofPattern("[[dd/]MM/]uuuu");

  function generateElements<T>(
    field: T[],
    element: 'div' | 'tag' | 'ul',
    callback?: (args: T) => React.ReactNode,
    omitLang?: boolean
  ) {
    const elements: JSX.Element[] = [];
    const lang = currentIndex.languageCode;

    for (let i = 0; i < field.length; i++) {
      if (field[i]) {
        const value = callback?.(field[i]) ?? field[i];
        switch (element) {
          case 'tag':
            elements.push(<span className="tag" lang={omitLang ? undefined : lang} key={i}>{value as React.ReactNode}</span>);
            break;
          case 'div':
            elements.push(<div lang={omitLang ? undefined : lang} key={i}>{value as React.ReactNode}</div>);
            break;
          case 'ul':
            elements.push(<li key={i}>{value as React.ReactNode}</li>)
        }
      }
    }

    if (elements.length === 0) {
      return <span>{t("language.notAvailable.field")}</span>;
    }

    if (element === 'ul') {
      return (
        <ul lang={omitLang ? undefined : lang}>
          {elements}
        </ul>
      );
    } else {
      return elements;
    }
  }

  function formatDate(
    dateTimeFormatter: DateTimeFormatter,
    date1?: string,
    date2?: string,
    dateFallback?: DataCollectionFreeText[]
  ): JSX.Element | JSX.Element[] {
    if (!date1 && !date2 && !dateFallback) {
      return <span>{t("language.notAvailable.field")}</span>;
    }
    if (!date1 && !date2 && dateFallback) {
      if (
        dateFallback.length === 2 &&
        dateFallback[0].event === "start" &&
        dateFallback[1].event === "end"
      ) {
        // Handle special case where array items are a start/end date range.
        return formatDate(
          dateTimeFormatter,
          dateFallback[0].dataCollectionFreeText,
          dateFallback[1].dataCollectionFreeText
        );
      }
      // Generate elements for each date in the array.
      return generateElements(dateFallback, "div", (date) =>
        parseDate(date.dataCollectionFreeText, dateTimeFormatter)
      );
    }

    if (date1) {
      if (!date2) {
        return <p>{parseDate(date1, dateTimeFormatter)}</p>;
      } else {
        return (
          <p>
            {parseDate(date1, dateTimeFormatter)} -{" "}
            {parseDate(date2, dateTimeFormatter)}
          </p>
        );
      }
    } else {
      return <span>{t("language.notAvailable.field")}</span>;
    }
  }

  /**
   * Attempt to format the given date string.
   *
   * @param dateString the date string to parse.
   * @param dateTimeFormatter the formatter to use.
   * @returns a formatted date, or the original string if an error occured when formatting.
   */
  function parseDate(
    dateString: string,
    dateTimeFormatter: DateTimeFormatter
  ): string {
    // Format array item as date if possible.
    try {
      const temporalAccessor = formatter.parse(dateString);
      return dateTimeFormatter.format(temporalAccessor);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Handle unparsable strings by returning the given value.
      return dateString;
    }
  }

  /**
   * Formats the given universe into a <p> element. The resulting element will contain
   * the text content "${Included universe} (excluding ${Excluded universe})"
   *
   * @param universe the universe to format
   * @returns the formatted <p> element
   */
  function formatUniverse(universe: Universe) {
    const inclusion = <p>{striptags(universe.inclusion)}</p>;

    if (universe.exclusion) {
      return (
        <>
          {inclusion}
          <p>Excludes: {striptags(universe.exclusion)}</p>
        </>
      );
    } else {
      return inclusion;
    }
  }

  function generateHeading(headingKey: string, classNames?: string, overrideId?: string) {
    // Find the heading object with the specified key
    const headingObj = headings.find((entry) => entry[headingKey]);

    if (!headingObj) {
      return null; // Handle the case where the heading key doesn't exist
    }

    const { translation, level } = headingObj[headingKey];
    const id = overrideId ? overrideId : headingObj[headingKey].id;
    const Element = level === 'main' ? 'h1' : (level === 'title' ? 'h2' : 'h3');

    return (

      <Element id={id} className={`metadata-${level} ${classNames ?? ''}`}>
        {translation}
      </Element>

    );
  }

  const handleExportMetadataChange = (selectedOption: Option | null) => {
    setSelectedExportMetadataOption(selectedOption);
  };

  const handleExportMetadata = async () => {
    if (selectedExportMetadataOption?.value) {
      let exportData;
      let fileName;
      let mimeType;
      const sanitizedTitle = item.titleStudy.toLowerCase().replace(/ /g, '_');

      switch (selectedExportMetadataOption.value) {
        case 'json': {
          // Fetch the JSON data from the API
          const jsonResponse = await fetch(`${window.location.origin}/api/json/${currentIndex.indexName}/${encodeURIComponent(item.id)}`);

          if (jsonResponse.ok) {
            exportData = JSON.stringify(await jsonResponse.json(), null, 2)
            fileName = `${sanitizedTitle}.json`;
            mimeType = 'application/json';
          } else {
            console.error('Failed to fetch JSON data');
            return;
          }
          break;
        }

        case 'ddi25': {
          // Set exportData for DDI export
          exportData = getDDI(item, dispLang);
          fileName = `${sanitizedTitle}.xml`;
          mimeType = 'application/xml';
          break;
        }

        default:
          break;
      }

      if (exportData && fileName && mimeType) {
        // Create a Blob containing the export data
        const blob = new Blob([exportData], { type: mimeType });
        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);
        // Create an <a> element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        // Trigger a click event on the <a> element to prompt the download
        a.click();
        // Release the Blob URL
        window.URL.revokeObjectURL(url);
      }
    }
  }


  /**
   * Formats the given creator inside span element with as much information as possible.
   *
   * The formatting includes:
   * - Creator name (always shown)
   * - One or more creator identifiers (e.g., ORCID) with logo and hyperlink, if available
   * - Affiliation name and one or more affiliation identifiers (e.g., ROR) with logo and hyperlink, if available
   *
   * Display logic:
   * - If only creator identifiers are present: "Name [PID1] [PID2] ... (Affiliation)"
   * - If only affiliation identifiers are present: "Name | Affiliation [Affiliation PID1] [Affiliation PID2] ..."
   * - If both creator and affiliation identifiers are present: "Name [PID1] [PID2] ... | Affiliation [Affiliation PID1] [Affiliation PID2] ..."
   * - If no identifiers are present: "Name (Affiliation)"
   *
   * Logos are shown for known identifier types (e.g., ORCID, ROR). Unknown types fall back to a label and plain text.
   * Each identifier is rendered as a clickable link if a URI is provided, otherwise as plain text.
   *
   * @param creator - The creator object containing name, affiliation, and a list of identifier details.
   * @returns A formatted span element representing the creator with enriched metadata.
   */
  const formatCreator = (creator: Creator) => {
    const renderIdentifier = (identifier: Identifier) => {
      if (!identifier) return null;

      const type = identifier.type?.toLowerCase();
      const isOrcid = type === "orcid";
      const isRor = type === "ror";

      const logo = isOrcid ? <OrcidLogo aria-label="ORCID logo" /> : isRor ? <RorLogo aria-label="ROR logo" /> : null;
      const label = !isOrcid && !isRor ? (identifier.type || "Research Identifier") + ": " : "";

      return (
        <span className="is-inline-block" key={identifier.id || identifier.uri}>
          {label}
          {identifier.uri ? (
            <a href={identifier.uri} target="_blank" rel="noopener noreferrer">
              {logo}
              <span className="icon"><FaExternalLinkAlt /></span>
              {identifier.id || identifier.uri}
            </a>
          ) : (
            <>
              {logo}
              {identifier.id}
            </>
          )}
        </span>
      );
    };

    const identifiers = [
      ...(creator.identifiers || []),
      // Could handle updated identifiers with just "creator.identifiers || []"
      // so this is to make it work with the old format where "identifier" was a single object
      ...("identifier" in creator && typeof creator.identifier === "object" && creator.identifier !== null
        ? [creator.identifier as Identifier]
        : [])
    ];

    const creatorIdentifiers = identifiers.filter(id =>
      id.role?.toLowerCase() === "pid" ||
      id.type?.toLowerCase() === "orcid" ||
      // Fallback: no role, and not clearly affiliation pid (e.g. ROR with affiliation defined)
      (!id.role && (id.type?.toLowerCase() !== "ror" || !creator.affiliation))
    );

    const affiliationIdentifiers = identifiers.filter(id =>
      creator.affiliation && (id.role?.toLowerCase() === "affiliation-pid" || (!id.role && id.type?.toLowerCase() === "ror"))
    );

    return (
      <span data-testid="creator">
        {creator.name}
        {creatorIdentifiers.length > 0 && (
          <>
            {" "}
            {creatorIdentifiers.map(renderIdentifier)}
          </>
        )}

        {creator.affiliation && (
          <>
            {" "}
            {(creatorIdentifiers.length > 0 || affiliationIdentifiers.length > 0)
              ? `| ${creator.affiliation}`
              : `(${creator.affiliation})`}

            {affiliationIdentifiers.length > 0 && (
              <>
                {" "}
                {affiliationIdentifiers.map(renderIdentifier)}
              </>
            )}
          </>
        )}
      </span>
    );
  };

  /**
   * Formats the given dataKindFreeTexts and generalDataFormats into the same array
   * with all free texts, types and formats combined while removing duplicates.
   * Array contains types first, general data formats second and free texts last.
   *
   * @param dataKindFreeTexts the data kind free texts and types to format
   * @param generalDataFormats the general data formats to format
   * @returns the formatted data kind free texts, types and formats in one array
   */
  const formatDataKind = (dataKindFreeTexts: DataKindFreeText[], generalDataFormats: TermVocabAttributes[]): string[] => {
    const uniqueValues = new Set<string>();
    dataKindFreeTexts.forEach(({ type }) => {
      if (type) uniqueValues.add(type);
    });
    generalDataFormats.forEach(item => uniqueValues.add(item.term));
    dataKindFreeTexts.forEach(({ dataKindFreeText }) => {
      if (dataKindFreeText) uniqueValues.add(dataKindFreeText);
    });
    return Array.from(uniqueValues);
  }
  const [searchParams] = useSearchParams();
  const dispLang = searchParams.get("lang") || currentIndex.languageCode;

  const languageLinks: JSX.Element[] = [];

  if (item.langAvailableIn.length > 1) {
    for (let i = 0; i < item?.langAvailableIn.length; i++) {
      const lang = item.langAvailableIn[i].toLowerCase();
      if (dispLang != lang) {
        languageLinks.push(
          <Link key={lang} className="button is-small mt-3 mr-1" to={`${location.pathname}?lang=${lang}`}>
            {lang.toUpperCase()}
          </Link>
        );
      } else {
        languageLinks.push(
          <span key={lang} className="button is-small is-static mt-3 mr-1">
            {lang.toUpperCase()}
          </span>
        );
      }
    }
  }

  /**
   * Converts plain text URLs in an HTML string into clickable anchor (`<a>`) tags,
   * while preserving any existing anchor tags in the input.
   *
   * Scans for plain text URLs (http/https), wraps them in anchor tags with
   * `target="_blank"` and `rel="noopener noreferrer"`, and handles edge cases
   * like trailing punctuation and unbalanced brackets.
   *
   * @param html - The input HTML string that may contain plain text URLs.
   * @returns A new HTML string with plain text URLs converted into clickable links.
   */
  const makeUrlsClickable = (html: string): string => {
    const addHyperlinks = (text: string): string => {
      return text.replace(/(https?:\/\/[^\s<>"')\]]+)([.,!?;:)\]]?)/g, (_match, url, trailing) => {
        let actualUrl = url;
        let actualTrailing = trailing;

        const bracketPairs: Record<string, string> = { ')': '(', ']': '[' };
        const opening = bracketPairs[trailing];

        if (opening) {
          const openCount = (url.match(new RegExp(`\\${opening}`, 'g')) || []).length;
          const closeCount = (url.match(new RegExp(`\\${trailing}`, 'g')) || []).length;
          if (closeCount < openCount) {
            actualUrl += trailing;
            actualTrailing = '';
          }
        }

        if (/[.,!?;:]$/.test(actualUrl)) {
          actualTrailing = actualUrl.slice(-1) + actualTrailing;
          actualUrl = actualUrl.slice(0, -1);
        }

        return `<a href="${actualUrl}" target="_blank" rel="noopener noreferrer">${actualUrl}</a>${actualTrailing}`;
      });
    };

    return html
      .split(/(<a\b[^>]*>.*?<\/a>)/gi)
      .map((part) => /^<a\b[^>]*>.*<\/a>$/i.test(part) ? part : addHyperlinks(part))
      .join('');
  };

  return (
    <>
      <Helmet>
        {item.titleStudy && (
          <title>{item.titleStudy} - {currentThematicView.longTitle}</title>
        )}

        {/* Open Graph */}
        {item.titleStudy && (
          <meta property="og:title" content={`${item.titleStudy} - ${currentThematicView.longTitle}`} />
        )}
        {item.abstractShort && (
          <meta property="og:description" content={item.abstractShort} />
        )}
        {item.studyUrl && (
          <meta property="og:url" content={item.studyUrl} />
        )}

        {/* Twitter */}
        {item.creators && (
          <meta name="twitter:label1" content="Creator" />
        )}
        {item.creators && (
          <meta name="twitter:data1" content={item.creators.map(c => c.name).join("; ")} />
        )}
        {item.publisher && (
          <meta name="twitter:label2" content="Publisher" />
        )}
        {item.publisher && (
          <meta name="twitter:data2" content={item.publisher.publisher} />
        )}

        {/* OAI-PMH describedby link */}
        {item.id && (
          <link
            key="describedby"
            rel="describedby"
            type="application/xml"
            href={`https://datacatalogue.cessda.eu/oai-pmh/v0/oai?verb=GetRecord&identifier=${item.id}&metadataPrefix=oai_ddi25`}
          />
        )}
      </Helmet>

      <div className="metadata-container study-wrapper">
        <div className="main-content">
          <article>
            <section className="metadata-section">
              <div className="columns is-gapless is-vcentered mb-0 mt-0 pt-5">
                <div className="column">
                  {item.studyUrl && (
                    <a
                      href={item.studyUrl}
                      rel="noreferrer"
                      target="_blank">
                      <span className="icon is-small">
                        <FaExternalLinkAlt />
                      </span>
                      &nbsp;
                      <span>{t("goToStudy")}&nbsp;&nbsp;</span>
                    </a>
                  )}

                  <a
                    href={`/api/json/${currentIndex.indexName}/${encodeURIComponent(item.id)}`}
                    rel="noreferrer"
                    target="_blank">
                    <span className="icon is-small"><FaCode /></span>
                    &nbsp;
                    <span>{t("viewJson")}</span>
                  </a>
                </div>

                <div className="column is-narrow">
                  <div className="columns is-mobile is-gapless">
                    <div className="column is-narrow mt-2">
                      <Select options={exportMetadataOptions}
                        defaultValue={exportMetadataOptions[0]}
                        isSearchable={false}
                        onChange={handleExportMetadataChange}
                        className="export-select"
                        aria-label="Export metadata"
                        classNamePrefix="react-select"
                        isClearable={false}
                        classNames={{
                          control: (state) =>
                            state.isFocused ? 'is-focused' : '',
                        }}
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            marginTop: '0',
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            boxShadow: 'none',
                            outline: 'none',
                          }),
                        }}
                      />
                    </div>
                    <div className="column is-narrow mt-2">
                      <button className="button export" onClick={handleExportMetadata} data-testid="export-metadata-button"
                        disabled={!selectedExportMetadataOption || selectedExportMetadataOption.value.trim() === ''}>
                        {t("exportMetadata")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns is-mobile is-gapless">
                <div className="column is-one-third is-flex">
                  {languageLinks}
                </div>
                <div className="column is-flex is-flex-wrap-wrap is-align-self-flex-end is-justify-content-end">
                  <button
                    className={`button is-small mt-3 mr-1 ${!showAllFields ? "is-static" : ""}`}
                    disabled={!showAllFields}
                    onClick={showAllFields ? () => dispatch(toggleAllFields(showAllFields)) : undefined}
                    data-testid="default-view-button"
                  >
                    {t("defaultView")}
                  </button>
                  <button
                    className={`button is-small mt-3 ${showAllFields ? "is-static" : ""}`}
                    disabled={showAllFields}
                    onClick={!showAllFields ? () => dispatch(toggleAllFields(showAllFields)) : undefined}
                    data-testid="all-elements-view-button"
                  >
                    {t("allElementsView")}
                  </button>
                </div>
              </div>

              {generateHeading('summary')}

              {!currentThematicView.excludeFields.includes('titleStudy') &&
                <>
                  {generateHeading('title', 'mt-5')}
                  <p>{item.titleStudy || t("language.notAvailable.field")}</p>
                </>
              }

              {!currentThematicView.excludeFields.includes('creators') &&
                <>
                  {generateHeading('creator')}
                  {generateElements(item.creators, 'div', creator => {
                    return formatCreator(creator);
                  })}
                </>
              }

              {!currentThematicView.excludeFields.includes('pidStudies') &&
                <React.Fragment key="pidStudies">
                  {generateHeading('pid')}
                  {generateElements(item.pidStudies.filter((p) => p.pid), "div",
                    (pidStudy) => {
                      const { pid, agency } = pidStudy;

                      const normalizedAgency = agency?.toUpperCase().trim();

                      let link: string | undefined = undefined;

                      // Only treat as DOI if:
                      // - (agency is DOI OR agency is missing/empty)
                      // - AND string is validated as a DOI
                      if (normalizedAgency === "DOI" || !normalizedAgency) {

                        if (URL.canParse(pid)) {

                          const pidURL = new URL(pid);

                          // Matches full DOI URLs (http or https)
                          if (/^https?:$/i.test(pidURL.protocol)) {
                            // Check if this is a DOI domain
                            if (pidURL.hostname === "doi.org" || pidURL.hostname === "dx.doi.org") {
                              link = `https://doi.org${pidURL.pathname}`;
                            }
                          }

                          // Matches short-form DOIs with 'doi:' prefix
                          else if (pidURL.protocol === "doi:") {
                            link = `https://doi.org/${pidURL.pathname}`;
                          }

                        } else {

                          // Matches DOIs based on prefix
                          const firstDot = pid.indexOf(".");
                          const directoryIndicator = pid.substring(0, firstDot);

                          // The DOI specification allows for directory indicators other
                          // than 10, but we will not check for these
                          if (directoryIndicator === "10") {

                            // Check if a registrant code exists (mandatory when the directory indicator is 10)
                            const firstSlash = pid.indexOf("/");
                            const registrantCode = pid.substring(firstDot + 1, firstSlash);

                            // Check if a suffix exists
                            const suffix = pid.substring(firstSlash + 1, pid.length);

                            // Valid DOI?
                            if (registrantCode && suffix) {
                              link = `https://doi.org/${pid}`;
                            }
                          }
                        }
                      }

                      return (
                        <p key={pid} data-testid="pid">
                          {link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              {link}
                            </a>
                          ) : (
                            pid
                          )}
                          {/* The agency field is an optional attribute, only append if present */}
                          {agency ? ` (${agency})` : null}
                        </p>
                      );
                    }
                  )}
                </React.Fragment>
              }

              {!currentThematicView.excludeFields.includes('dataAccess') &&
                <>
                  {generateHeading('dataAccess')}
                  <p>{item.dataAccess === 'Uncategorized' ? `${item.dataAccess}, see Terms of data access` : item.dataAccess || t("language.notAvailable.information")}</p>
                </>
              }

              {!currentThematicView.excludeFields.includes("series") && (showAllFields || item.series.length > 0) &&
                <>
                  {generateHeading('series')}
                  <SeriesList seriesList={item.series} lang={currentIndex.languageCode} />
                </>
              }

              {!currentThematicView.excludeFields.includes('abstract') &&
                <>
                  {generateHeading('abstract')}
                  {abstractExpanded ? (
                    <div
                      data-testid="abstract-full"
                      dangerouslySetInnerHTML={{ __html: makeUrlsClickable(item.abstract) }}
                    />
                  ) : (
                    <div data-testid="abstract-truncated">
                      {truncate(striptags(item.abstract), {
                        length: truncatedAbstractLength,
                        separator: " ",
                      })}
                    </div>
                  )}
                  {(item.abstract.length > truncatedAbstractLength && abstractWithoutTags !== item.abstractLong) && (
                    <a className="button is-small is-light mt-2" data-testid="expand-abstract"
                      onClick={() => {
                        setAbstractExpanded(abstractExpanded => !abstractExpanded)
                      }}>
                      {abstractExpanded ? (
                        <>
                          <span className="icon is-small">
                            <FaAngleUp />
                          </span>
                          <span>{t("readLess")}</span>
                        </>
                      ) : (
                        <>
                          <span className="icon is-small">
                            <FaAngleDown />
                          </span>
                          <span>{t("readMore")}</span>
                        </>
                      )}
                    </a>
                  )}
                </>
              }
            </section>

            {!currentThematicView.excludeFields.includes('classifications') &&
              <section className="metadata-section">

                {generateHeading('topics', 'is-inline-flex')}
                <Tooltip content={t("metadata.topics.tooltip.content")}
                  ariaLabel={t("metadata.topics.tooltip.ariaLabel")}
                  classNames={{ container: 'mt-1 ml-1' }} />
                <div className="tags mt-2">
                  {generateElements(item.classifications, "tag",
                    (classifications) => (
                      <Link to={`/?sortBy=${currentIndex.indexName}&classifications%5B0%5D=${encodeURI(classifications.term.toLowerCase())}`}>
                        {upperFirst(classifications.term)}
                      </Link>
                    )
                  )}
                </div>
              </section>
            }

            {!currentThematicView.excludeFields.includes('keywords') &&
              <section className="metadata-section">
                {generateHeading('keywords', 'is-inline-flex')}


                <Tooltip content={t("metadata.keywords.tooltip.content")}
                  ariaLabel={t("metadata.keywords.tooltip.ariaLabel")}
                  classNames={{ container: 'mt-1 ml-1' }} />
                <Keywords keywords={item.keywords.slice().sort((a, b) => a.term.localeCompare(b.term))} keywordLimit={12} lang={currentIndex.languageCode} currentIndex={currentIndex.indexName} />
              </section>
            }

            <section className="metadata-section">
              {generateHeading('methodology', 'is-inline-flex')}
              <Tooltip content={t("metadata.methodology.tooltip.content")}
                ariaLabel={t("metadata.methodology.tooltip.ariaLabel")}
                classNames={{ container: 'mt-1 ml-1' }} />

              {/*  If hiding the below field group, use "dataCollectionPeriodStartdate" in excludeFields in src/utilities/thematicViews.ts */}
              {!currentThematicView.excludeFields.includes('dataCollectionPeriodStartdate') &&
                <>
                  {generateHeading('collPeriod')}
                  <>
                    {formatDate(
                      dateFormatter,
                      item.dataCollectionPeriodStartdate,
                      item.dataCollectionPeriodEnddate,
                      item.dataCollectionFreeTexts
                    )}
                  </>
                </>
              }

              {!currentThematicView.excludeFields.includes('studyAreaCountries') &&
                <>
                  {generateHeading('country')}
                  <div className="tags mt-2">
                    {generateElements(item.studyAreaCountries, "tag", (country) => country.country)}
                  </div>
                </>
              }

              {!currentThematicView.excludeFields.includes('typeOfTimeMethods') &&
                <>
                  {generateHeading('timeDimension')}
                  {generateElements(item.typeOfTimeMethods, "div", (time) => time.term)}
                </>
              }

              {!currentThematicView.excludeFields.includes('unitTypes') && (showAllFields || item.unitTypes.length > 0) &&
                <>
                  {generateHeading('analysisUnit')}
                  {generateElements(item.unitTypes, "div", (unit) => unit.term)}
                </>
              }

              {!currentThematicView.excludeFields.includes('universe') &&
                (showAllFields || (item.universe && item.universe.inclusion)) &&
                <>
                  {generateHeading('universe')}
                  {item.universe ? formatUniverse(item.universe) : <span>{t("language.notAvailable.field")}</span>}
                </>
              }

              {!currentThematicView.excludeFields.includes('samplingProcedureFreeTexts') &&
                (showAllFields || item.samplingProcedureFreeTexts.length > 0) &&
                <>
                  {generateHeading('sampProc')}
                  {generateElements(item.samplingProcedureFreeTexts, "div",
                    (text) => (
                      <div
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    )
                  )}
                </>
              }

              {/* If hiding the below field group, use "generalDataFormats" in excludeFields in src/utilities/thematicViews.ts */}
              {!currentThematicView.excludeFields.includes('generalDataFormats') &&
                (showAllFields || (item.dataKindFreeTexts?.length > 0 || item.generalDataFormats?.length > 0)) &&
                <>
                  {generateHeading('dataKind')}
                  {item.dataKindFreeTexts || item.generalDataFormats ? generateElements(formatDataKind(item.dataKindFreeTexts, item.generalDataFormats), 'div', text =>
                    <div dangerouslySetInnerHTML={{ __html: text }} data-testid="data-kind" />
                  ) : <span>{t("language.notAvailable.field")}</span>}
                </>
              }

              {!currentThematicView.excludeFields.includes('typeOfModeOfCollections') &&
                (showAllFields || item.typeOfModeOfCollections.length > 0) &&
                <>
                  {generateHeading('collMode')}
                  {generateElements(item.typeOfModeOfCollections, "div", (method) => method.term)}
                </>
              }

            </section>


            {!currentThematicView.excludeFields.includes("funding") &&
              (showAllFields || item.funding.some(f => f.agency || f.grantNumber)) &&
              <section className="metadata-section" data-testid="funding">
                {generateHeading("funding", "is-inline-flex")}
                {(item.funding.length > 0 ? item.funding : [{}]).map((funding, index) => (
                  <React.Fragment key={`funder-${index}-grant-${index}`}>
                    {(showAllFields || funding.agency) && (
                      <>
                        {generateHeading(`funder-${index}`)}
                        <p lang={currentIndex.languageCode}>
                          {funding.agency || t("language.notAvailable.field")}
                        </p>
                      </>
                    )}
                    {(showAllFields || funding.grantNumber) && (
                      <>
                        {generateHeading(`grantNumber-${index}`)}
                        <p lang={currentIndex.languageCode}>
                          {funding.grantNumber || t("language.notAvailable.field")}
                        </p>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </section>
            }

            <section className="metadata-section">
              {generateHeading('access')}

              {!currentThematicView.excludeFields.includes('publisher') &&
                <>
                  {generateHeading('publisher')}
                  <p>{item.publisher ? item.publisher.publisher : t("language.notAvailable.field")}</p>
                </>
              }

              {!currentThematicView.excludeFields.includes('publicationYear') &&
                <>
                  {generateHeading('publicationYear')}
                  {formatDate(DateTimeFormatter.ofPattern("uuuu"), item.publicationYear)}
                </>
              }

              {!currentThematicView.excludeFields.includes('dataAccessFreeTexts') &&
                <>
                  {generateHeading('accessTerms')}
                  {generateElements(item.dataAccessFreeTexts, "div",
                    (text) => (
                      <div
                        data-testid="access-terms"
                        dangerouslySetInnerHTML={{ __html: makeUrlsClickable(text) }}
                      />
                    )
                  )}
                </>
              }
            </section>

            <section className="metadata-section">
              {!currentThematicView.excludeFields.includes('relatedPublications') &&
                (showAllFields || item.relatedPublications.length > 0) &&
                <>
                  {generateHeading('relPub')}
                  {generateElements(
                    // Sort related publications by publication date, descending
                    [...item.relatedPublications]
                      .sort((a, b) => {
                        const dateA = a.publicationDate ? new Date(a.publicationDate) : undefined;
                        const dateB = b.publicationDate ? new Date(b.publicationDate) : undefined;

                        if (!dateA && !dateB) return 0;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        return dateB.getTime() - dateA.getTime();
                      }),
                    "ul",
                    (relatedPublication) => {
                      const relatedPublicationTitle = striptags(relatedPublication.title);
                      const holdingUrl = relatedPublication.holdings?.find(h => h.startsWith('http'));

                      return holdingUrl ? (
                        <a href={holdingUrl}>{relatedPublicationTitle}</a>
                      ) : (
                        relatedPublicationTitle
                      );
                    }
                  )}
                </>
              }
            </section>
          </article>
        </div>
      </div>
    </>
  );
}

export default Detail;
