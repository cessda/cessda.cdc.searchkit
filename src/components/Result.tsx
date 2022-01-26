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

import React, { Component } from 'react';
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt, FaLanguage } from 'react-icons/fa';
import Translate from 'react-translate-component';
import { connect, Dispatch } from 'react-redux';
import { AnyAction, bindActionCreators } from 'redux';
import { toggleLongAbstract } from '../actions/search';
import { Link } from 'react-router';
import type { State } from '../types';
import { changeLanguage } from '../actions/language';
import { push } from 'react-router-redux';
import { CMMStudy } from '../../common/metadata';

type Props = {
  bemBlocks: any;
  index: number;
  item: CMMStudy;
} & ReturnType<typeof mapDispatchToProps>;

function generateCreatorElements(item: CMMStudy) {
  let creators: JSX.Element[] = [];

  for (let i: number = 0; i < item.creators.length; i++) {
    creators.push(
      <span key={i}>
        {item.creators[i]}{i < item.creators.length - 1 ? '; ' : ''}
      </span>
    );

    if (i === 2 && item.creators.length > 3) {
      creators.push(<span key={3}>({item.creators.length - 3} more)</span>);
      break;
    }
  }

  return creators;
}

export class Result extends Component<Props> {

  render() {
    const {
      bemBlocks,
      index,
      item,
    } = this.props;

    if (item === undefined) {
      return null;
    }

    let languages: JSX.Element[] = [];
    for (let i: number = 0; i < item.langAvailableIn.length; i++) {
      languages.push(
        <Link key={i}
              className="button is-small is-white" 
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
        <h4 className={bemBlocks.item().mix(bemBlocks.container('hith4'))}>
          <Link to={{
            pathname: "/detail",
            query: {
             q: item.id
            }
          }}><span dangerouslySetInnerHTML={{__html: item.titleStudyHighlight || item.titleStudy}}></span></Link>
        </h4>
        <div className={bemBlocks.item().mix(bemBlocks.container('meta'))}>
          {creators}
        </div>
        <div className={bemBlocks.item().mix(bemBlocks.container('desc'))}>
          {item.abstractExpanded && <span className="abstr" dangerouslySetInnerHTML={{__html: item.abstractHighlight || item.abstract}}/>} 
          {!item.abstractExpanded && <span dangerouslySetInnerHTML={{__html: item.abstractHighlightShort || item.abstractShort}}/>}
        </div>
        <span className="level mt-10 result-actions">
          <span className="level-left is-hidden-touch">
            <div className="field is-grouped">
              <div className="control">
                {item.abstract.length > 500 &&
                 <a className={bemBlocks.item().mix('button is-small is-white')} onClick={() => {
                   this.props.toggleLongAbstract(item.titleStudy, index);
                 }}>
                   {item.abstractExpanded ?
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
            </div>
          </span>
          <span className="level-right">
            <div className="field is-grouped is-grouped-multiline">
              {languages.length > 0 &&
               <div className="control">
                 <div className="buttons has-addons">
                  <span className="button is-small is-white bg-w pe-none">
                    <span className="icon is-small">
                      <FaLanguage/>
                    </span>
                    <span><Translate content="language.label"/>:</span>
                  </span>
                   {languages}
                 </div>
               </div>
              }
              <div className="control">
                {item.studyUrl &&
                 <a className="button is-small is-white"
                    href={item.studyUrl}
                    target="_blank">
                   <span className="icon is-small"><FaExternalLinkAlt/></span>
                   <Translate component="span" content="goToStudy"/>
                 </a>
                }
              </div>
            </div>
          </span>
        </span>
      </div>
    );
  }
}

export function mapStateToProps(state: State, props: Props) {
  return {
    item: state.search.displayed[props.index]
  };
}

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    push: bindActionCreators(push, dispatch),
    changeLanguage: bindActionCreators(changeLanguage, dispatch),
    toggleLongAbstract: bindActionCreators(toggleLongAbstract, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Result);
