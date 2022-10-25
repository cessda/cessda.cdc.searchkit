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
import { Layout, LayoutBody, LayoutResults, SearchkitProvider, SideBar } from 'searchkit';
import Header from '../components/Header';
import Language from '../components/Language';
import Detail from '../components/Detail';
import Footer from '../components/Footer';
import searchkit from '../utilities/searchkit';
import Panel from '../components/Panel';
import { connect, Dispatch } from 'react-redux';
import { FaAngleLeft, FaCode, FaExternalLinkAlt } from 'react-icons/fa';
import { AnyAction, bindActionCreators } from 'redux';
import Translate from 'react-translate-component';
import Similars from '../components/Similars';
import { goBack } from 'react-router-redux';
import type { State } from '../types';
import counterpart from 'counterpart';
import _ from 'lodash';
import { getJsonLd } from '../../common/metadata';
import { updateStudy } from '../actions/detail';

export type Props = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

export class DetailPage extends Component<Props> {

  constructor(props: Props | undefined) {
    super(props);
    const id = this.props.query;
    if (id && id !== this.props.item?.id) {
      this.props.updateStudy(_.trim(id, "\""));
    }
    this.updateTitle();
  }

  componentDidUpdate() {
    // Check if the query has changed, if it has ask for the store to be updated.
    const id = this.props.query;
    if (id && id !== this.props.item?.id) {
      this.props.updateStudy(_.trim(id, "\""));
    }
    this.updateTitle();
  }

  private updateTitle() {
    if (this.props.item) {
      document.title = `${this.props.item.titleStudy} - ${counterpart.translate('datacatalogue')}`;
    } else {
      document.title = `${counterpart.translate('language.notAvailable.title')} - ${counterpart.translate('datacatalogue')}`;
    }
  }

  render() {
    const {
      item,
      currentLanguage,
      goBack
    } = this.props;

    // Get the Elasticsearch index for the current language. Used to pass index to View JSON link.
    const index = currentLanguage.index;

    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <Header/>
          <div className="container mb-3">
          <LayoutBody className="columns">
            <SideBar className="is-hidden-mobile column is-4">
              <Panel title={<Translate content='similarResults.heading'/>}
                     collapsable={true}
                     defaultCollapsed={false}>
                <Similars/>
              </Panel>
            </SideBar>
            <LayoutResults className="column is-8">
            {item ? 
              <>
                <div className="panel">
                  <a className="button is-small is-white is-pulled-right" onClick={goBack}>
                    <FaAngleLeft/><Translate className="ml-5" content="back"/>
                  </a>
        
                  {item.studyUrl &&
                  <a className="button is-small is-white is-pulled-left"
                      href={item.studyUrl}
                      rel="noreferrer"
                      target="_blank">
                    <span className="icon is-small"><FaExternalLinkAlt/></span>
                    <Translate content="goToStudy"/>
                  </a>
                  } 
        
                  <a className="button is-small is-white is-pulled-left"
                    href={`/api/json/${index}/${encodeURIComponent(item.id)}`}
                    rel="noreferrer"
                    target="_blank">
                  <span className="icon is-small"><FaCode/></span>
                  <Translate content="viewJson"/>
                  </a>
        
                  <div className="is-clearfix"/>
                </div>
                <Detail item={item}/>
              </>
            :
              <div className="panel pt-15">
                <p className="fs-14 mb-15">
                  <Translate component="strong" content="language.notAvailable.heading"/>
                </p>
                <Translate component="p" className="fs-14 mb-15" content="language.notAvailable.content"/>
                <Language/>
              </div>
            }
            </LayoutResults>
          </LayoutBody>
          </div>
          {item &&
            <script type="application/ld+json">
              {JSON.stringify(getJsonLd(item))}
            </script>
          }
          <Footer/>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export function mapStateToProps(state: State) {
  const query = state.routing.locationBeforeTransitions.query.q;
  return {
    item: state.detail.study,
    currentLanguage: state.language.currentLanguage,
    query: Array.isArray(query) ? query.join() : query
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    goBack: bindActionCreators(goBack, dispatch),
    updateStudy: bindActionCreators(updateStudy, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
