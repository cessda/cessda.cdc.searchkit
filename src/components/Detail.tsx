
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

import React from "react";
import { Link } from "react-router";
import Panel from "./Panel";
import Translate from "react-translate-component";
import { truncate, upperFirst } from "lodash";
import { CMMStudy, DataCollectionFreeText, Universe } from "../../common/metadata";
import { ChronoField, DateTimeFormatter, DateTimeFormatterBuilder } from "@js-joda/core";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import striptags from "striptags";

export interface Props {
  item: CMMStudy;
}

export interface State {
  abstractExpanded: boolean;
}

export default class Detail extends React.Component<Props, State> {

  private static readonly truncatedAbstractLength = 2000;

  constructor(props: Props) {
    super(props);
    // Set the abstract to the expanded state if shorter than Detail.truncatedAbstractLength
    this.state = { 
      abstractExpanded: !(props.item.abstract.length > Detail.truncatedAbstractLength)
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

  static generateElements<T, R>(
    field: T[],
    element: 'p' | 'tag',
    callback?: (args: T) => R
  ) {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < field.length; i++) {
      if (field[i]) {
        const value = callback?.(field[i]) ?? field[i];
        if (element === 'tag') {
          elements.push(
            <span className="tag" key={i}>
              {value}
            </span>
          );
        } else {
          elements.push(<div key={i}>{value}</div>);
        }
      }
    }

    if (elements.length === 0) {
      return <Translate content="language.notAvailable.field" />;
    }

    return elements;
  }

  static formatDate(
    dateTimeFormatter: DateTimeFormatter,
    date1?: string,
    date2?: string,
    dateFallback?: DataCollectionFreeText[]
  ): JSX.Element | JSX.Element[] {
    if (!date1 && !date2 && !dateFallback) {
      return <Translate content="language.notAvailable.field" />;
    }
    if (!date1 && !date2 && dateFallback) {
      if (dateFallback.length === 2 && dateFallback[0].event === 'start' && dateFallback[1].event === 'end') {
        // Handle special case where array items are a start/end date range.
        return Detail.formatDate(dateTimeFormatter, dateFallback[0].dataCollectionFreeText, dateFallback[1].dataCollectionFreeText);
      }
      // Generate elements for each date in the array.
      return (
          Detail.generateElements(
            dateFallback,
            'p',
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
      return <Translate content="language.notAvailable.field" />;
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
   * Formats the given universes into a <p> element. The resulting element will contain
   * the text content "${Included universe} (excluding ${Excluded universe})"
   * 
   * @param universes the universes to format
   * @returns the formatted <p> element, or "Not available" if no universes are present
   */
  private static formatUniverses(universes: Universe[]) {
    if (!universes) {
      return <Translate content="language.notAvailable.field" />;
    }

    let universeString = universes.filter(u => u.clusion === "I").map(u => u.content)[0];

    const excludedUniverse = universes.filter(u => u.clusion === "E")[0];
    if (excludedUniverse) {
      universeString = `${universeString} (excluding ${excludedUniverse.content})`;
    }

    return <p>{universeString}</p>;
  }

  render() {
    const { item } = this.props;

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

        <p>
          {item.titleStudy || <Translate content="language.notAvailable.field" />}
        </p>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.creator"
          />
          {Detail.generateElements(item.creators, 'p')}
        </section>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.studyPersistentIdentifier"
          />
          {Detail.generateElements(item.pidStudies.filter(p => p.pid), 'p', pidStudy => {
            // The agency field is an optional attribute, only append if present
            if (pidStudy.agency) {
              return <p>{`${pidStudy.pid} (${pidStudy.agency})`}</p>;
            }

            return <p>{pidStudy.pid}</p>;
          })}
        </section>

        <section>
          <Translate
            className="data-label"
            component="h2"
            content="metadata.abstract"
          />
          {this.state.abstractExpanded ?
            <div className="data-abstract" dangerouslySetInnerHTML={{ __html: item.abstract }}/>
          :
            <div className="data-abstract">{truncate(striptags(item.abstract), { length: Detail.truncatedAbstractLength, separator: ' ' })}</div>
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
          title={<Translate component="h2" content="metadata.methodology.label"/>}
          tooltip={<Translate content="metadata.methodology.tooltip" unsafe/>}
          collapsable={false}
          defaultCollapsed={false}
        >
          <Translate
            className="data-label"
            component="h3"
            content="metadata.dataCollectionPeriod"
          />
          {Detail.formatDate(
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
          {Detail.generateElements(item.studyAreaCountries, 'p', country => country.country)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.timeDimension"
          />
          {Detail.generateElements(item.typeOfTimeMethods, 'p', time => time.term)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.analysisUnit"
          />
          {Detail.generateElements(item.unitTypes, 'p', unit => unit.term)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.universes"
          />
          {Detail.formatUniverses(item.universes)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.samplingProcedure"
          />
          {Detail.generateElements(item.samplingProcedureFreeTexts, 'p', text => 
            <div className="data-abstract" dangerouslySetInnerHTML={{__html: text}}/>
          )}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.dataCollectionMethod"
          />
          {Detail.generateElements(item.typeOfModeOfCollections, 'p', method => method.term)}

          {/* <Translate
            className="data-label"
            component="h3"
            content="metadata.languageOfDataFiles"
          />
          <div className="tags mt-10">
            {Detail.generateElements(item.fileLanguages, 'tag', term => _.upperCase(term))}
          </div> */}
        </Panel>

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
          <p>
            {item.publisher ? item.publisher.publisher : <Translate content="language.notAvailable.field" />}
          </p>

          <Translate
            className="data-label"
            component="h3"
            content="metadata.yearOfPublication"
          />
          {Detail.formatDate(DateTimeFormatter.ofPattern("uuuu"), item.publicationYear)}

          <Translate
            className="data-label"
            component="h3"
            content="metadata.termsOfDataAccess"
          />
          {Detail.generateElements(item.dataAccessFreeTexts, 'p', text => 
            <div className="data-abstract" dangerouslySetInnerHTML={{ __html: text }} />
          )}
        </Panel>

        <Panel
          className="section-header"
          title={<Translate component="h2" content='metadata.topics.label'/>}
          tooltip={<Translate content="metadata.topics.tooltip" unsafe/>}
          collapsable={false}
        >
          <div className="tags">
            {Detail.generateElements(
              item.classifications,
              'tag',
              classifications => <Link to={"/?classifications.term[0]=" + encodeURI(classifications.term)}>{upperFirst(classifications.term)}</Link>
            )}
          </div>
        </Panel>

        <Panel
          className="section-header"
          title={<Translate component="h2" content='metadata.keywords.label'/>}
          tooltip={<Translate content="metadata.keywords.tooltip" unsafe/>}
          collapsable={false}
        >
          <div className="tags">
            {Detail.generateElements(item.keywords, 'tag', keywords => 
              <Link to={`/?q="${encodeURI(keywords.term)}"`}>{upperFirst(keywords.term)}</Link>
            )}
          </div>
        </Panel>
      </article>
    );
  }
}
