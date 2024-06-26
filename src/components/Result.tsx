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

import React, { Component } from 'react';
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt, FaLanguage } from 'react-icons/fa';
import Translate from 'react-translate-component';
import { connect, Dispatch } from 'react-redux';
import { AnyAction, bindActionCreators } from 'redux';
import { Link } from 'react-router';
import type { State } from '../types';
import { changeLanguage } from '../actions/language';
import { push } from 'react-router-redux';
import { CMMStudy, TermVocabAttributes } from '../../common/metadata';
import getPaq from '../utilities/getPaq';
import Keywords from './Keywords';

type Props = {
  bemBlocks: any;
  currentLanguage: string;
  index: number;
  item: CMMStudy;
} & ReturnType<typeof mapDispatchToProps>;

interface ComponentState {
  abstractExpanded: boolean;
  shuffledKeywords: TermVocabAttributes[];
}

// How many creators should be shown
const creatorsLength = 3;

function generateCreatorElements(item: CMMStudy) {
  const creators: JSX.Element[] = [];

  for (let i = 0; i < item.creators.length; i++) {
    const creator = item.creators[i];
    let creatorsString = creator.name;
    if (creator.affiliation) {
      creatorsString += ` (${creator.affiliation})`
    }

    creators.push(
      <span key={i}>
        {creatorsString}{i < item.creators.length - 1 ? '; ' : ''}
      </span>
    );

    if (i === 2 && item.creators.length > creatorsLength) {
      creators.push(<span key={3}>({item.creators.length - creatorsLength} more)</span>);
      break;
    }
  }

  return creators;
}

// Randomize array using Durstenfeld shuffle algorithm
function shuffleArray<T>(array: Array<T>) {
  if (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return array;
}

export class Result extends Component<Props, ComponentState> {

  private static readonly truncatedKeywordsLength = 7;

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.item && (!prevProps.item || this.props.item.keywords !== prevProps.item.keywords)) {
      this.setState({
        shuffledKeywords: shuffleArray(this.props.item.keywords)
      });
    }
  }

  handleKeyDown(event: React.KeyboardEvent, titleStudy: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.handleAbstractExpansion(titleStudy);
    }
  }

  handleAbstractExpansion(titleStudy: string) {
    // Notify Matomo Analytics of toggling "Read more" for a study.
    const _paq = getPaq();
    _paq.push(['trackEvent', 'Search', 'Read more', titleStudy]);

    this.setState(state => ({
      abstractExpanded: !state.abstractExpanded
    }));
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      abstractExpanded: false,
      shuffledKeywords: props.item ? shuffleArray(props.item.keywords) : []
    };
  }

  render() {
    const {
      bemBlocks,
      currentLanguage,
      item,
    } = this.props;

    if (item === undefined) {
      return null;
    }

    const languages: JSX.Element[] = [];
    for (let i = 0; i < item.langAvailableIn.length; i++) {
      languages.push(
        <Link key={i}
              className="button is-small is-white focus-visible"
              to={{
                pathname: '/detail',
                query: {
                  q: item.id,
                  lang: item.langAvailableIn[i].toLowerCase()
                }
              }}
              onClick={()=> this.props.changeLanguage(item.langAvailableIn[i])}>
          {item.langAvailableIn[i]}
        </Link>
      );
    }

    const creators = generateCreatorElements(item);

    return (
      <div className="list_hit" data-qa="hit">
        <h4 className={bemBlocks.item().mix(bemBlocks.container('hith4'))} lang={currentLanguage}>
          <Link to={{
            pathname: "/detail",
            query: {
             q: item.id,
             lang: currentLanguage
            }
          }}><span dangerouslySetInnerHTML={{__html: item.titleStudyHighlight || item.titleStudy}}></span></Link>
        </h4>
        <div className={bemBlocks.item().mix(bemBlocks.container('meta'))} lang={currentLanguage}>
          {creators}
        </div>
        <div className={bemBlocks.item().mix(bemBlocks.container('desc'))} lang={currentLanguage}>
          {this.state.abstractExpanded ?
            <span dangerouslySetInnerHTML={{__html: item.abstractHighlightLong || item.abstractLong}}/>
          :
            <span dangerouslySetInnerHTML={{__html: item.abstractHighlightShort || item.abstractShort}}/>
          }
        </div>
        {this.state.shuffledKeywords.length > 0 &&
          <div className="is-flex mt-10">
            <Keywords keywords={this.state.shuffledKeywords} keywordLimit={Result.truncatedKeywordsLength}
                      lang={currentLanguage} isExpandDisabled={true}/>
          </div>
        }
        <div className="result-actions mt-10">
          <div className="is-flex is-hidden-touch">
            {item.abstract.length > 380 &&
              <a className={bemBlocks.item().mix('button is-small is-white focus-visible')} tabIndex={0}
                onClick={() => this.handleAbstractExpansion(item.titleStudy)}
                onKeyDown={(e) => this.handleKeyDown(e, item.titleStudy)}>
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
          </div>
          <div className="is-flex is-flex-wrap-wrap">
            {languages.length > 0 &&
              <div className="buttons has-addons">
                <span className="button is-small is-white bg-w pe-none">
                  <span className="icon is-small">
                    <FaLanguage/>
                  </span>
                  <span><Translate content="language.label"/>:</span>
                </span>
                <span>
                  {languages}
                </span>
              </div>
            }
            <span>
              {item.studyUrl &&
                <a className="button is-small is-white focus-visible"
                  href={item.studyUrl}
                  rel="noreferrer"
                  target="_blank">
                  <span className="icon is-small"><FaExternalLinkAlt/></span>
                  <Translate component="span" content="goToStudy"/>
                </a>
              }
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: State, props: Props) {
  return {
    currentLanguage: state.language.currentLanguage.code,
    item: state.search.displayed[props.index]
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    push: bindActionCreators(push, dispatch),
    changeLanguage: bindActionCreators(changeLanguage, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Result);
