
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

import React from "react";
import { Link } from "react-router";
import Tooltip from './Tooltip';
import Panel from "./Panel";
import Translate from "react-translate-component";
import { upperFirst } from "lodash";
import { CMMStudy, DataCollectionFreeText, DataKindFreeText, Universe } from "../../common/metadata";
import { ChronoField, DateTimeFormatter, DateTimeFormatterBuilder } from "@js-joda/core";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import striptags from "striptags";
import counterpart from "counterpart";
import Keywords from "./Keywords";

export interface Props {
  item: CMMStudy;
  lang: string;
}

export interface State {
  abstractExpanded: boolean;
}

export default class Detail extends React.Component<Props, State> {

  private static readonly truncatedAbstractLength = 2000;
  private static readonly truncatedKeywordsLength = 12;

  constructor(props: Props) {
    super(props);
    // Set the abstract to the expanded state if shorter than Detail.truncatedAbstractLength
    this.state = {
      abstractExpanded: !(props.item.abstract.length > Detail.truncatedAbstractLength),
    };
  }

  componentDidUpdate(prevProps: Props) {
    // If the item has changed, reset the expanded state of the abstract
    if (this.props.item.id !== prevProps.item.id) {
      this.setState(() => ({
        abstractExpanded: !(this.props.item.abstract.length > Detail.truncatedAbstractLength)
      }));
    }
  }

  private static readonly formatter = new DateTimeFormatterBuilder()
    .appendValue(ChronoField.YEAR)
    .optionalStart().appendLiteral("-").appendValue(ChronoField.MONTH_OF_YEAR)
    .optionalStart().appendLiteral("-").appendValue(ChronoField.DAY_OF_MONTH)
    .optionalStart().appendLiteral( "T" ).append(DateTimeFormatter.ISO_OFFSET_TIME)
    .toFormatter();

  static readonly dateFormatter = DateTimeFormatter.ofPattern("[[dd/]MM/]uuuu");

  generateElements<T, R>(
    field: T[],
    element: 'div' | 'tag' | 'ul',
    callback?: (args: T) => R,
    omitLang?: boolean
  ) {
    const elements: JSX.Element[] = [];
    const lang = this.props.lang;

    for (let i = 0; i < field.length; i++) {
      if (field[i]) {
        const value = callback?.(field[i]) ?? field[i];
        switch(element) {
          case 'tag':
            elements.push(<span className="tag" lang={omitLang ? undefined : lang} key={i}>{value}</span>);
            break;
          case 'div':
            elements.push(<div lang={omitLang ? undefined : lang} key={i}>{value}</div>);
            break;
          case 'ul':
            elements.push(<li key={i}>{value}</li>)
        }
      }
    }

    if (elements.length === 0) {
      return <Translate content="language.notAvailable.field" lang={lang} />;
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

  /**
   * Joins the values extracted from objects in an array of objects by the given separator
   *
   * @param arr the array of objects
   * @param extractor the function to retrieve the value from each object
   * @param separator the character(s) used for joining the field values
   * @returns <div> element that contains the values separated by the separator
   */
  joinValuesBySeparator<T>(arr: Array<T>, extractor: (object: T) => string, separator: string) {
    return (
      <div lang={this.props.lang}>{arr.map(element => extractor(element)).filter(value => value && value.trim() !== '').join(separator)}</div>
    )
  }

  formatDate(
    dateTimeFormatter: DateTimeFormatter,
    date1?: string,
    date2?: string,
    dateFallback?: DataCollectionFreeText[]
  ): JSX.Element | JSX.Element[] {
    if (!date1 && !date2 && !dateFallback) {
      return <Translate content="language.notAvailable.field" lang={this.props.lang} />;
    }
    if (!date1 && !date2 && dateFallback) {
      if (dateFallback.length === 2 && dateFallback[0].event === 'start' && dateFallback[1].event === 'end') {
        // Handle special case where array items are a start/end date range.
        return this.formatDate(dateTimeFormatter, dateFallback[0].dataCollectionFreeText, dateFallback[1].dataCollectionFreeText);
      }
      // Generate elements for each date in the array.
      return (
          this.generateElements(
            dateFallback,
            'div',
            date => Detail.parseDate(date.dataCollectionFreeText, dateTimeFormatter)
          )
      );
    }

    if (date1) {
      if (!date2) {
        return <p>{Detail.parseDate(date1, dateTimeFormatter)}</p>;
      } else {
        return <p>{Detail.parseDate(date1, dateTimeFormatter)} - {Detail.parseDate(date2, dateTimeFormatter)}</p>
      }
    } else {
      return <Translate content="language.notAvailable.field" lang={this.props.lang} />;
    }
  }

  /**
   * Attempt to format the given date string.
   *
   * @param dateString the date string to parse.
   * @param dateTimeFormatter the formatter to use.
   * @returns a formatted date, or the original string if an error occured when formatting.
   */
  private static parseDate(dateString: string, dateTimeFormatter: DateTimeFormatter): string {
    // Format array item as date if possible.
    try {
      const temporalAccessor = Detail.formatter.parse(dateString);
      return dateTimeFormatter.format(temporalAccessor);
    } catch (e) {
      // Handle unparsable strings by returning the given value.
      console.debug(e);
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
  private formatUniverse(universe: Universe) {
    const inclusion = <p lang={this.props.lang}>{striptags(universe.inclusion)}</p>;

    if (universe.exclusion) {
      return (
        <>
          {inclusion}
          <p lang={this.props.lang}>Excludes: {striptags(universe.exclusion)}</p>
        </>
      );
    } else {
      return inclusion;
    }
  }

  /**
   * Transforms the given dataKindFreeTexts from DataKindFreeText[] to string[] with
   * all free texts and types combined into the same array with types before free texts
   * and duplicates removed.
   *
   * @param dataKindFreeTexts the data kind free texts and types to transform
   * @returns the transformed data kind free texts and types in one array
   */
  transformDataKindFreeTexts(dataKindFreeTexts: DataKindFreeText[]): string[] {
    const types = new Set<string>();
    const freeTexts = new Set<string>();
    dataKindFreeTexts.forEach(({ dataKindFreeText, type }) => {
      if (type) types.add(type);
      if (dataKindFreeText) freeTexts.add(dataKindFreeText);
    });
    return [...types, ...freeTexts];
  }

  render() {
    const { item, lang } = this.props;

    return (
      <article className="w-100">
      <div className="summary-header">
Summary information
      </div>
        <Translate
          className="data-label mt-5"
          component="h1"
          content="metadata.studyTitle"
        />

        <p lang={lang}>
          {item.titleStudy || <Translate content="language.notAvailable.field"/>}
        </p>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.creator"
          />
          {this.generateElements(item.creators, 'div', creator => {
            if (creator.affiliation) {
              return `${creator.name} (${creator.affiliation})`;
            } else {
              return creator.name;
            }
          })}
        </section>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.studyPersistentIdentifier"
          />
          {this.generateElements(item.pidStudies.filter(p => p.pid), 'div', pidStudy => {
            // The agency field is an optional attribute, only append if present
            if (pidStudy.agency) {
              return <p>{`${pidStudy.pid} (${pidStudy.agency})`}</p>;
            }

            return <p>{pidStudy.pid}</p>;
          }, true)}
        </section>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.abstract"
          />
          {this.state.abstractExpanded ?
            <div className="data-abstract" lang={lang} dangerouslySetInnerHTML={{ __html: item.abstract }}/>
          :
            <div className="data-abstract" lang={lang} dangerouslySetInnerHTML={{ __html: item.abstractLong }}/>
          }
          {item.abstract.length > Detail.truncatedAbstractLength &&
            <a className="button is-small is-white" onClick={() => {
              this.setState(state => ({
                abstractExpanded: !state.abstractExpanded
              }));
            }}>
              {this.state.abstractExpanded ?
              <>
                <span className="icon is-small"><FaAngleUp/></span>
                <Translate component="span" content="readLess"/>
              </>
              :
              <>
                <span className="icon is-small"><FaAngleDown/></span>
                <Translate component="span" content="readMore"/>
              </>
              }
            </a>
          }
        </section>

        <Panel
          className="section-header"
          title={<Translate component="h2" content='metadata.topics.label'/>}
          tooltip={<Tooltip id="metadata-topics-tooltip"
                            content={<Translate content='metadata.topics.tooltip.content' unsafe/>}
                            ariaLabel={counterpart.translate("metadata.topics.tooltip.ariaLabel")}/>}
          collapsable={false}
        >
          <div className="tags">
            {this.generateElements(
              item.classifications,
              'tag',
              classifications => <Link to={"/?classifications.term[0]=" + encodeURI(classifications.term)}>{upperFirst(classifications.term)}</Link>
            )}
          </div>
        </Panel>

        <Panel
          className="section-header"
          title={<Translate component="h2" content='metadata.keywords.label'/>}
          tooltip={<Tooltip id="metadata-keywords-tooltip"
                            content={<Translate content='metadata.keywords.tooltip.content' unsafe/>}
                            ariaLabel={counterpart.translate("metadata.keywords.tooltip.ariaLabel")}/>}
          collapsable={false}
        >
          <Keywords keywords={item.keywords} keywordLimit={Detail.truncatedKeywordsLength} lang={this.props.lang}/>
        </Panel>

        <Panel
          className="section-header"
          title={<Translate component="h2" content="metadata.methodology.label"/>}
          tooltip={<Tooltip id="metadata-methodology-tooltip"
                            content={<Translate content='metadata.methodology.tooltip.content' unsafe/>}
                            ariaLabel={counterpart.translate("metadata.methodology.tooltip.ariaLabel")}/>}
          collapsable={false}
          defaultCollapsed={false}
        >
          <Translate
            className="data-label"
            component="h3"
            content="metadata.dataCollectionPeriod"
          />
          {this.formatDate(
            Detail.dateFormatter,
            item.dataCollectionPeriodStartdate,
            item.dataCollectionPeriodEnddate,
            item.dataCollectionFreeTexts
          )}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.country"
          />
          {this.joinValuesBySeparator(item.studyAreaCountries, c => c.country, ", ")}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.timeDimension"
          />
          {this.generateElements(item.typeOfTimeMethods, 'div', time => time.term)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.analysisUnit"
          />
          {this.generateElements(item.unitTypes, 'div', unit => unit.term)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.universe"
          />
          {item.universe ? this.formatUniverse(item.universe) : <Translate content="language.notAvailable.field" lang={lang} />}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.samplingProcedure"
          />
          {this.generateElements(item.samplingProcedureFreeTexts, 'div', text =>
            <div className="data-abstract" dangerouslySetInnerHTML={{__html: text}}/>
          )}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.dataKind"
          />
          {item.dataKindFreeTexts ? this.generateElements(this.transformDataKindFreeTexts(item.dataKindFreeTexts), 'div', text =>
            <div className="data-abstract" dangerouslySetInnerHTML={{__html: text}}/>
          ) : <Translate content="language.notAvailable.field" lang={lang} /> }

          <Translate
            className="data-label"
            component="h3"
            content="metadata.dataCollectionMethod"
          />
          {this.generateElements(item.typeOfModeOfCollections, 'div', method => method.term)}
        </Panel>

        {item.funding.length > 0 &&
          <Panel
            id="funding-information"
            className="section-header"
            title={<Translate component="h2" content='metadata.funding'/>}
            collapsable={false}
          >
            {item.funding.map(funding => (
              <React.Fragment key={`${funding.agency || ''}${funding.grantNumber || ''}`}>
                {funding.agency &&
                  <>
                    <Translate
                      className="data-label"
                      component="h3"
                      content="metadata.funder"
                    />
                    <p lang={lang}>
                      {funding.agency}
                    </p>
                  </>
                }
                {funding.grantNumber &&
                  <>
                    <Translate
                      className={`data-label${funding.agency ? ' mt-1' : ''}`}
                      component="h3"
                      content="metadata.grantNumber"
                    />
                    <p lang={lang}>
                      {funding.grantNumber}
                    </p>
                  </>
                }
              </React.Fragment>
            ))}
          </Panel>
        }

        <Panel
          className="section-header"
          title={<Translate component="h2" content='metadata.access'/>}
          collapsable={false}
        >
          <Translate
            className="data-label"
            component="h3"
            content="metadata.publisher"
          />
          <p lang={lang}>
            {item.publisher ? item.publisher.publisher : <Translate content="language.notAvailable.field" />}
          </p>

          <Translate
            className="data-label"
            component="h3"
            content="metadata.yearOfPublication"
          />
          {this.formatDate(DateTimeFormatter.ofPattern("uuuu"), item.publicationYear)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.termsOfDataAccess"
          />
          {this.generateElements(item.dataAccessFreeTexts, 'div', text =>
            <div className="data-abstract" dangerouslySetInnerHTML={{ __html: text }} />
          )}
        </Panel>

        <Panel
          className="section-header"
          title={<Translate component="h2" content="metadata.relatedPublications"/>}
          collapsable={false}
        >
          {this.generateElements(item.relatedPublications, 'ul', relatedPublication => {
            const relatedPublicationTitle = striptags(relatedPublication.title);
            if (relatedPublication.holdings?.length > 0) {
              return <span lang={relatedPublication.lang ? relatedPublication.lang : undefined}><a href={relatedPublication.holdings[0]}>{relatedPublicationTitle}</a></span>;
            } else {
              return <span lang={relatedPublication.lang ? relatedPublication.lang : undefined}>{relatedPublicationTitle}</span>;
            }
          }, true)}
        </Panel>
      </article>
    );
  }
}
