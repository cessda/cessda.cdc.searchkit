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

import React from "react";
import { TermURIResult, TermVocabAttributes } from "../../common/metadata";
import { upperFirst } from "lodash";
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt } from "react-icons/fa";
import { getELSSTTerm } from "../utilities/elsst";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router";

export interface Props {
  keywords: TermVocabAttributes[];
  lang: string;
  currentIndex: string;
  keywordLimit: number;
  isExpandDisabled?: boolean;
}

interface State {
  isExpanded: boolean;
  elsstURLs: TermURIResult;
}

export class Keywords extends React.Component<Props & WithTranslation, State> {
  
  private abortController = new AbortController();

  constructor(props: Props & WithTranslation) {
    super(props);
    this.state = {
      isExpanded: !(props.keywords.length > props.keywordLimit),
      elsstURLs: {}
    };
  }

  componentDidMount(): void {
    // Reset the abort controller when remounted if triggered
    if (this.abortController.signal.aborted) {
      this.abortController = new AbortController();
    }
    this.getELSSTURLs(this.props.keywords);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.keywords !== prevProps.keywords) {
      this.setState({
        isExpanded: this.props.keywords.length <= this.props.keywordLimit,
      });
      this.getELSSTURLs(this.props.keywords);
    }
  }

  componentWillUnmount(): void {
    // Cancel ongoing fetch requests
    this.abortController.abort();
  }

  private generateElements<T> (
    field: T[],
    callback: (args: T) => React.JSX.Element | string,
  ) {
    const elements: React.JSX.Element[] = [];

    for (let i = 0; i < field.length; i++) {
      if (field[i]) {
        const value = callback(field[i]);
        elements.push(<span className="tag" data-testid="tag" lang={this.props.lang} key={i}>{value}</span>);
      }
    }

    if (elements.length === 0) {
      return <div lang={this.props.lang}>{this.props.t("language.notAvailable.field", this.props.lang)}</div>;
    }
    return elements;
  }

  private async getELSSTURLs(keywords: TermVocabAttributes[]) {
    // Only get ELSST terms for shown keywords if expanding is disabled
    const elsstTerms = this.props.isExpandDisabled ? keywords.slice(0, this.props.keywordLimit).map(k => k.term) : keywords.map(k => k.term);
    const elsstURLs = await getELSSTTerm(elsstTerms, this.props.lang, this.abortController.signal);

    this.setState({
      elsstURLs: elsstURLs
    });
  }
  
  render(): React.ReactNode {
    const { t } = this.props;
  
    return (<>
    
      <div className="tags" data-testid="tags">
        {this.generateElements(this.state.isExpanded ? this.props.keywords : this.props.keywords.slice(0, this.props.keywordLimit),
          keywords => {
            // If the term is a valid ELSST term, also link to ELSST
            const keywordTerm = upperFirst(keywords.term);
            return (<>
              <Link to={{pathname: "/" + location.pathname.split('/')[1].replace("detail",""), search: `?keywords[0]=${encodeURI(keywords.term.toLowerCase())}&sortBy=${this.props.currentIndex}`}}>{keywordTerm}</Link>
              {this.state.elsstURLs[keywords.term] &&
                <span className="is-inline-flex is-align-items-center">&nbsp;(
                  <a href={this.state.elsstURLs[keywords.term]} rel="noreferrer" target="_blank"
                    className="is-inline-flex is-align-items-center" data-testid="elsst-link">
                    <span className="icon"><FaExternalLinkAlt/></span>ELSST
                  </a>)
                </span>
              }
            </>)
          }
        )}
        {this.props.isExpandDisabled && this.props.keywords.length > this.props.keywordLimit &&
          <span className="tag" data-testid="tag">
            <span>&nbsp;({this.props.keywords.length - this.props.keywordLimit}&nbsp;</span>
            <span>{t("more")}</span>
            <span>)</span>
          </span>
        }
      </div>
      {!this.props.isExpandDisabled && this.props.keywords.length > this.props.keywordLimit &&
        <a className="button is-small is-white" data-testid="expand-keywords" onClick={() =>
          // Toggle the expanded state
          this.setState(state => ({ isExpanded: !state.isExpanded }))
        }>
          {this.state.isExpanded ?
          <>
            <span className="icon is-small"><FaAngleUp/></span>
            <span>{t("readLess")}</span>
          </>
          :
          <>
            <span className="icon is-small"><FaAngleDown/></span>
            <span>{t("readMore")}</span>
          </>
          }
        </a>
      }
    </>);
  }
}

export default withTranslation()(Keywords);
