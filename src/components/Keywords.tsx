// Copyright CESSDA ERIC 2017-2023
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

import React, { createRef } from "react";
import { Link, browserHistory } from "react-router";
import { TermVocabAttributes } from "../../common/metadata";
import { upperFirst } from "lodash";
import Translate from "react-translate-component";
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt } from "react-icons/fa";
import { TermURIResult, getELSSTTerm } from "../utilities/elsst";

export interface Props {
  keywords: TermVocabAttributes[];
  lang: string;
  keywordLimit: number;
  isExpandDisabled?: boolean;
}

interface State {
  isExpanded: boolean;
  elsstURLs: TermURIResult;
}

export default class Keywords extends React.Component<Props, State> {

  private controllerRef = createRef<AbortController>();

  constructor(props: Props) {
    super(props);
    this.state = {
      isExpanded: !(props.keywords.length > props.keywordLimit),
      elsstURLs: {}
    };
  }

  componentDidMount(): void {
    this.getELSSTURLs(this.props.keywords);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.keywords !== prevProps.keywords) {
      this.setState({
        isExpanded: !(this.props.keywords.length > this.props.keywordLimit),
      });
      this.getELSSTURLs(this.props.keywords);
    }
  }

  componentWillUnmount(): void {
    this.controllerRef.current && this.controllerRef.current.abort();
  }

  private generateElements<T> (
    field: T[],
    callback: (args: T) => JSX.Element | string,
  ) {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < field.length; i++) {
      if (field[i]) {
        const value = callback(field[i]);
        elements.push(<span className="tag" lang={this.props.lang} key={i}>{value}</span>);
      }
    }

    if (elements.length === 0) {
      return <Translate content="language.notAvailable.field" lang={this.props.lang} />;
    }
    return elements;
  }

  private async getELSSTURLs(keywords: TermVocabAttributes[]) {
    (this.controllerRef as React.MutableRefObject<AbortController>).current = new AbortController();
    // Only get ELSST terms for shown keywords if expanding is disabled
    const elsstTerms = this.props.isExpandDisabled ? keywords.slice(0, this.props.keywordLimit).map(k => k.term) : keywords.map(k => k.term);
    const elsstURLs = await getELSSTTerm(elsstTerms, this.props.lang, this.controllerRef.current!.signal);

    !this.controllerRef.current!.signal.aborted && this.setState({
      elsstURLs: elsstURLs
    });
  }

  render(): React.ReactNode {
    return (<>
      <div className="tags">
        {this.generateElements(this.state.isExpanded ? this.props.keywords : this.props.keywords.slice(0, this.props.keywordLimit),
          keywords => {
            // If the term is a valid ELSST term, also link to ELSST
            const keywordTerm = upperFirst(keywords.term);
            // state.requireRefresh is used in App to update key so page gets updated even when location is the same
            const keywordLinkTo = browserHistory.getCurrentLocation().pathname === "/" ?
              {pathname: '/', search: `?keywords.term[0]=${encodeURI(keywords.term)}`, state: {requireRefresh: true}}
              :
              {pathname: '/', search: `?keywords.term[0]=${encodeURI(keywords.term)}`};
            return (<>
              <Link to={keywordLinkTo}>{keywordTerm}</Link>
              {this.state.elsstURLs[keywords.term] &&
                <span className="is-inline-flex is-align-items-center">&nbsp;(
                  <a href={this.state.elsstURLs[keywords.term]} rel="noreferrer" target="_blank"
                    className="is-inline-flex is-align-items-center">
                    <span className="icon"><FaExternalLinkAlt/></span>ELSST
                  </a>)
                </span>
              }
            </>)
          }
        )}
        {this.props.isExpandDisabled && this.props.keywords.length > this.props.keywordLimit &&
          <span className="tag">
            <span>&nbsp;({this.props.keywords.length - this.props.keywordLimit}&nbsp;</span>
            <Translate component="span" content="more" />
            <span>)</span>
          </span>
        }
      </div>
      {!this.props.isExpandDisabled && this.props.keywords.length > this.props.keywordLimit &&
        <a className="button is-small is-white" onClick={() =>
          // Toggle the expanded state
          this.setState(state => ({ isExpanded: !state.isExpanded }))
        }>
          {this.state.isExpanded ?
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
    </>);
  }
}
