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
import { useAppSelector } from "../hooks";
import Keywords from "./Keywords";
import SeriesList from './SeriesList';
import OrcidLogo from "./OrcidLogo";
import { Helmet } from "react-helmet-async";

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
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);

  const item = props.item;
  const headings = props.headings;
  const truncatedAbstractLength = 2000;


  const [abstractExpanded, setAbstractExpanded] = useState(props.item.abstract.length < truncatedAbstractLength);
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
   * Formats the given creator inside span element with as much information as possible, preferably
   * creator name, creator affiliation and research identifier. Research identifier will also include
   * the specific type and hyperlink for uri when they available. Hyperlink text is usually id but can
   * be uri if id is empty but uri still exists. Minimum value for creator is the creator name.
   *
   * @param creator the creator to format
   * @returns formatted creator in span element
   */
  const formatCreator = (creator: Creator) => {
    const creatorFormatted = (
      <span data-testid="creator">
        {creator.name}
        {creator.affiliation && ` (${creator.affiliation})`}
        {creator.identifier && (
          <React.Fragment key={`${creator.name}`}>
            {" - "}
            <span className="is-inline-block">
              {creator.identifier.type?.toLowerCase() !== "orcid" &&
                <React.Fragment key={`${creator.identifier.type || "Research Identifier"}`}>
                  {creator.identifier.type || "Research Identifier"}{": "}
                </React.Fragment>
              }
              {creator.identifier.uri ? (
                <a href={creator.identifier.uri} target="_blank" rel="noreferrer">
                  {creator.identifier.type?.toLowerCase() === "orcid" &&
                    <OrcidLogo />
                  }
                  <span className="icon"><FaExternalLinkAlt /></span>
                  {creator.identifier.id ? creator.identifier.id : creator.identifier.uri}
                </a>
              ) : (
                creator.identifier.id
              )}
            </span>
          </React.Fragment>
        )}
      </span>
    );
    return creatorFormatted;
  }

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

  return (
    <>
      <Helmet>
        <title>{item.titleStudy || t("language.notAvailable.field")} - {currentThematicView.longTitle}</title>
      </Helmet>

      <div className="metadata-container study-wrapper">

        <div className="main-content">
          <article>
            <section className="metadata-section">
              <div className="columns is-gapless is-vcentered mb-0 mt-0">
                <div className="column smalltext">

                  {item.studyUrl && (
                    <a
                      href={item.studyUrl}
                      rel="noreferrer"
                      target="_blank">
                      <span className="icon is-small">
                        <FaExternalLinkAlt />
                      </span>
                      &nbsp;
                      <span className="is-small">
                        {t("goToStudy")}
                        &nbsp;&nbsp;</span>
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


                    {/* <Tooltip content={t("metadata.keywords.tooltip.content")}
                    ariaLabel={t("metadata.keywords.tooltip.ariaLabel")}
                    classNames={{container: 'ml-1'}}/> */}
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
              {languageLinks}

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
                      // The agency field is an optional attribute, only append if present
                      if (pidStudy.agency) {
                        return <p key={pidStudy.pid}>{`${pidStudy.pid} (${pidStudy.agency})`}</p>;
                      }
                      return <p key={pidStudy.pid}>{pidStudy.pid}</p>;
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

              {!currentThematicView.excludeFields.includes('series') &&
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
                      className="data-abstract"
                      dangerouslySetInnerHTML={{ __html: item.abstract }}
                    />
                  ) : (
                    <div className="data-abstract">
                      {truncate(striptags(item.abstract), {
                        length: truncatedAbstractLength,
                        separator: " ",
                      })}
                    </div>
                  )}
                  {item.abstract.length > truncatedAbstractLength && (
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
                <div className="tags mt-2">
                  <Keywords keywords={item.keywords.slice().sort((a, b) => a.term.localeCompare(b.term))} keywordLimit={12} lang={currentIndex.languageCode} currentIndex={currentIndex.indexName} />
                </div>
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

              {!currentThematicView.excludeFields.includes('unitTypes') &&
                <>
                  {generateHeading('analysisUnit')}
                  {generateElements(item.unitTypes, "div", (unit) => unit.term)}
                </>
              }

              {!currentThematicView.excludeFields.includes('universe') &&
                <>
                  {generateHeading('universe')}
                  {item.universe ? formatUniverse(item.universe) : <span>{t("language.notAvailable.field")}</span>}
                </>
              }

              {!currentThematicView.excludeFields.includes('samplingProcedureFreeTexts') &&
                <>
                  {generateHeading('sampProc')}
                  {generateElements(item.samplingProcedureFreeTexts, "div",
                    (text) => (
                      <div
                        className="data-abstract"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    )
                  )}
                </>
              }

              {/* If hiding the below field group, use "generalDataFormats" in excludeFields in src/utilities/thematicViews.ts */}
              {!currentThematicView.excludeFields.includes('generalDataFormats') &&
                <>
                  {generateHeading('dataKind')}
                  {item.dataKindFreeTexts || item.generalDataFormats ? generateElements(formatDataKind(item.dataKindFreeTexts, item.generalDataFormats), 'div', text =>
                    <div className="data-abstract" dangerouslySetInnerHTML={{ __html: text }} data-testid="data-kind" />
                  ) : <span>{t("language.notAvailable.field")}</span>}
                </>
              }

              {!currentThematicView.excludeFields.includes('typeOfModeOfCollections') &&
                <>
                  {generateHeading('collMode')}
                  {generateElements(item.typeOfModeOfCollections, "div", (method) => method.term)}
                </>
              }

            </section>


            {!currentThematicView.excludeFields.includes('funding') &&
              <>
                {item.funding.length > 0 &&
                  <section className="metadata-section" data-testid='funding'>
                    {generateHeading('funding', 'is-inline-flex')}
                    {item.funding.map((funding, index) => (
                      <React.Fragment key={`${funding.agency || ''}${funding.grantNumber || ''}`}>
                        {funding.agency &&
                          <>
                            {generateHeading(`funder-${index}`)}
                            <p lang={currentIndex.languageCode}>
                              {funding.agency}
                            </p>
                          </>
                        }
                        {funding.grantNumber &&
                          <>
                            {generateHeading(`grantNumber-${index}`)}
                            <p lang={currentIndex.languageCode}>
                              {funding.grantNumber}
                            </p>
                          </>
                        }
                      </React.Fragment>
                    ))}
                  </section>
                }
              </>
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
                        className="data-abstract"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    )
                  )}
                </>
              }
            </section>

            <section className="metadata-section">
              {!currentThematicView.excludeFields.includes('relatedPublications') &&
                <>
                  {generateHeading('relPub')}
                  {generateElements(
                    // Sort related publications by publication date, descending
                    [...item.relatedPublications]
                      .sort((a, b) => {
                        const parseDate = (d: string) => d ? new Date(d) : null;
                        const dateA = parseDate(a.publicationDate);
                        const dateB = parseDate(b.publicationDate);

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
