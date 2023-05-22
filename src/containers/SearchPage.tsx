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

import React, {Component} from 'react';
import MultiSelect from '../components/MultiSelect';
import Result from '../components/Result';
import Footer from '../components/Footer';
import TopBar from '../components/Topbar';
import Pagination from '../components/Pagination';
import {
  Hits, InputFilter, Layout, LayoutBody, LayoutResults, NoHits, Pagination as SearchkitPagination, RangeFilter, RangeSliderInput,
  RefinementListFilter, SearchkitProvider, SideBar
} from 'searchkit';
import Translate from 'react-translate-component';
import Header from '../components/Header';
import {connect} from 'react-redux';
import Tooltip from '../components/Tooltip';
import Panel from '../components/Panel';
import searchkit from '../utilities/searchkit';
import _ from 'lodash';
import $ from 'jquery';
import type {State} from '../types';
import counterpart from 'counterpart';

export type Props = ReturnType<typeof mapStateToProps>;

export class SearchPage extends Component<Props> {

  componentDidMount() {
    this.updateTitle();
    searchkit.resetState();

    // Remove the JSON-LD representation if present
    const jsonLDElement = document.getElementById("json-ld");
    if (jsonLDElement) {
      jsonLDElement.remove();
    }
  }

  componentDidUpdate(): void {
    // Auto expand filters if they contain selected values.
    this.autoExpandFilter('classifications.term');
    this.autoExpandFilter('dataCollectionYear');
    this.autoExpandFilter('studyAreaCountries.searchField');
    this.autoExpandFilter('publisher.publisher');

    // Set the page title
    this.updateTitle();
  }

  updateTitle() {
    if (this.props.filters.q) {
      document.title = `${this.props.filters.q} - ${counterpart.translate('datacatalogue')}`;
    } else {
      document.title = counterpart.translate('datacatalogue');
    }
  }

  autoExpandFilter(filterName: string): void {
    const filter = $(`.filter--${filterName.replace('.', '\\.')} > .is-collapsed`);
    if (!filter.data('expanded') && !_.isEmpty(this.props.filters[filterName])) {
      filter.data('expanded', true).trigger("click");
    }
  }

  render() {
    const {
      showMobileFilters
    } = this.props;
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout className={showMobileFilters ? 'show-mobile-filters' : ''}>
          <Header/>
          <div className="container">
          <LayoutBody className="columns">
            <SideBar className="column is-4">
              <div className="float">
                <RefinementListFilter id="classifications.term"
                                      title={counterpart.translate('filters.topic.label')}
                                      field={'classifications.term'}
                                      fieldOptions={{
                                        type: 'nested',
                                        options: {path: 'classifications', min_doc_count: 1}
                                      }}
                                      orderKey="_count"
                                      orderDirection="desc"
                                      operator="OR"
                                      containerComponent={<Panel title={<Translate content='filters.topic.label'/>}
                                                                tooltip={<Translate content="filters.topic.tooltip" unsafe/>}
                                                                className="classifications"
                                                                collapsable={true}
                                                                defaultCollapsed={true}/>}
                                      listComponent={<MultiSelect placeholder={<Translate content='filters.topic.placeholder'/>}/>}
                                      size={100}/>

                {/* <RefinementListFilter id="keywords.term"
                                      title={counterpart.translate('filters.topic.label')}
                                      field={'keywordsSearchField'}
                                      orderKey="_key"
                                      orderDirection="asc"
                                      operator="OR"
                                      containerComponent={<Panel title={<Translate content='filters.topic.label'/>}
                                                                tooltip={<Translate content="filters.topic.tooltip" unsafe/>}
                                                                className="keywords"
                                                                collapsable={true}
                                                                defaultCollapsed={true}/>}
                                      listComponent={<MultiSelect placeholder={<Translate content='filters.topic.placeholder'/>}/>}
                                      size={2700}/> */}

                <InputFilter id="keywords.term"
                              title="Keywords"
                              searchOnChange={false}
                              placeholder="Keywords"
                              containerComponent={<Panel title="Keywords"
                                                                tooltip={<Translate content="filters.topic.tooltip" unsafe/>}
                                                                className="Keywords"
                                                                collapsable={true}
                                                                defaultCollapsed={true}/>}
                              queryFields={["keywordsSearchField"]}/>

                <RangeFilter min={1900}
                            max={new Date().getFullYear()}
                            field="dataCollectionYear"
                            id="dataCollectionYear"
                            title={counterpart.translate('filters.collectionDates.label')}
                            rangeComponent={RangeSliderInput}
                            containerComponent={<Panel title={<Translate content='filters.collectionDates.label'/>}
                                                        tooltip={<Tooltip id="filters-collectiondates-tooltip"
                                                                          content={counterpart.translate("filters.collectionDates.tooltip.content")}
                                                                          ariaLabel={counterpart.translate("filters.collectionDates.tooltip.ariaLabel")}/>}
                                                        className="dataCollectionYear"
                                                        collapsable={true}
                                                        defaultCollapsed={true}/>}/>

                <RefinementListFilter id="studyAreaCountries.searchField"
                                      title={counterpart.translate('filters.country.label')}
                                      field={'studyAreaCountries.searchField'}
                                      fieldOptions={{
                                        type: 'nested',
                                        options: {path: 'studyAreaCountries', min_doc_count: 1}
                                      }}
                                      orderKey="_key"
                                      orderDirection="asc"
                                      operator="OR"
                                      containerComponent={<Panel title={<Translate content='filters.country.label'/>}
                                                                tooltip={<Tooltip id="filters-country-tooltip"
                                                                                  content={counterpart.translate("filters.country.tooltip.content")}
                                                                                  ariaLabel={counterpart.translate("filters.country.tooltip.ariaLabel")}/>}
                                                                className="studyAreaCountries"
                                                                collapsable={true}
                                                                defaultCollapsed={true}/>}
                                      listComponent={<MultiSelect placeholder={<Translate content='filters.country.placeholder'/>}
                                                                  ariaLabel={counterpart.translate('filters.country.label')}/>}
                                      size={500}/>

                <RefinementListFilter id="publisher.publisher"
                                      title={counterpart.translate('filters.publisher.label')}
                                      field={'publisherFilter.publisher'}
                                      fieldOptions={{
                                        type: 'nested',
                                        options: {path: 'publisherFilter', min_doc_count: 1}
                                      }}
                                      orderKey="_key"
                                      orderDirection="asc"
                                      operator="OR"
                                      containerComponent={<Panel title={<Translate content='filters.publisher.label'/>}
                                                                tooltip={<Tooltip id="filters-publisher-tooltip"
                                                                                  content={counterpart.translate("filters.publisher.tooltip.content")}
                                                                                  ariaLabel={counterpart.translate("filters.publisher.tooltip.ariaLabel")}/>}
                                                                className="publisher"
                                                                collapsable={true}
                                                                defaultCollapsed={true}/>}
                                      listComponent={<MultiSelect placeholder={<Translate content='filters.publisher.placeholder'/>}
                                                                  ariaLabel={counterpart.translate('filters.publisher.label')}/>}
                                      size={500}/>
              </div>
            </SideBar>
            <LayoutResults className="column is-8">
              <TopBar/>

              <SearchkitPagination pageScope={3}
                                   showLast={true}
                                   showNumbers={true}
                                   listComponent={<Pagination ariaLabel={counterpart.translate('pagination.navTop')}/>}/>

              <Hits scrollTo={true}
                    mod="sk-hits-list"
                    hitsPerPage={30}
                    customHighlight={{
                      fields: {
                        titleStudy: { number_of_fragments: 0 }, 
                        abstract: { number_of_fragments: 0 }
                      }
                    }}
                    itemComponent={Result}
                    key={'hitList'}/>

              <NoHits mod="is-size-6 sk-no-hits"/>

              <SearchkitPagination pageScope={3}
                                   showLast={true}
                                   showNumbers={true}
                                   listComponent={<Pagination ariaLabel={counterpart.translate('pagination.navBottom')}/>}/>
            </LayoutResults>
          </LayoutBody>
          </div>
          <Footer/>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export function mapStateToProps(state: State) {
  return {
    showMobileFilters: state.search.showMobileFilters,
    filters: state.search.state
  };
}

export default connect(mapStateToProps)(SearchPage);
