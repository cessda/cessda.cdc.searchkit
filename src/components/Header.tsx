
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
import { GroupedSelectedFilters, HitsStats, ResetFilters } from 'searchkit';
import Language from './Language';
import { connect, Dispatch } from 'react-redux';
import { Link } from 'react-router';
import counterpart from 'counterpart';
import Reset from './Reset';
import { queryBuilder } from '../utilities/searchkit';
import SearchBox from './SearchBox';
import type { State, Thunk } from '../types';
import { AnyAction, bindActionCreators } from 'redux';
import {
  resetSearch, toggleAdvancedSearch, ToggleAdvancedSearchAction, toggleMobileFilters, ToggleMobileFiltersAction, toggleSummary, ToggleSummaryAction
} from '../actions/search';
import Translate from 'react-translate-component';

interface Props {
  pathname: string;
  code: string;
  filters: any;
  showFilterSummary: boolean;
  showMobileFilters: boolean;
  showAdvancedSearch: boolean;
  totalStudies: number;
  resetSearch: () => Thunk;
  toggleSummary: () => ToggleSummaryAction;
  toggleMobileFilters: () => ToggleMobileFiltersAction;
  toggleAdvancedSearch: () => ToggleAdvancedSearchAction;
};

export class Header extends Component<Props> {

  render() {
    const {
      pathname,
      resetSearch,
      filters,
      showFilterSummary,
      toggleSummary,
      showMobileFilters,
      toggleMobileFilters,
      showAdvancedSearch
    } = this.props;

    return (
      <header>

        <div className="container">
          <Translate component="a" className="cessda-organisation" href="https://www.cessda.eu/" content="cessda" />
        
        </div>

        <div className="container">
          <div className="columns">
            <div className="column is-narrow">
              <div className="logo">
                <Link className="cessda-eric" to="/" onClick={()=>{
                  // Only reset search on the root path, otherwise two locations are added to the browser history
                  if (resetSearch && pathname === '/') {
                    resetSearch();
                  }
                }}/>
              </div>
              {pathname === '/' &&
                <HitsStats className="hits-count" />
              }
            </div>
            <div className="column"><div className="search-wrapper">
              <SearchBox autofocus={true} searchOnChange={true} queryBuilder={queryBuilder} />
              <Language />
              </div>
  
              <div className="reset-search">
                {pathname === '/' &&
                  <a className="sk-reset-filters link mobile-filters-toggle" onClick={toggleMobileFilters}>
                    {showMobileFilters ? <Translate content="hideFilters"/> : <Translate content="showFilters"/>}
                  </a>
                }

                <Translate component={Link} to="/about" className="sk-reset-filters link" content="about.label"/>

                <Translate component="a" href="/documentation" className="sk-reset-filters link" content="documentation.label"/>

                {filters &&
                  <Translate component="a" className="sk-reset-filters link" onClick={toggleSummary} content="filters.summary.label" />
                }

                <ResetFilters component={Reset}
                              options={{query: false, filter: true, pagination: true}}
                              translations={{
                                'reset.clear_all': counterpart.translate('reset.filters')
                              }}/>
                <ResetFilters component={Reset}
                              options={{query: true, filter: false, pagination: true}}
                              translations={{
                                'reset.clear_all': counterpart.translate('reset.query')
                              }}/>
              </div>
            </div>
          </div>
        </div>

        {showFilterSummary &&
          <div className="modal is-active">
            <div className="modal-background"/>
            <div className="modal-card">
              <div className="modal-card-head">
                <Translate component="h2" className="modal-card-title" content="filters.summary.label"/>
                <button className="delete" aria-label="close" onClick={toggleSummary} />
              </div>
              <section className="modal-card-body">
                {filters ?
                  <div>
                    <Translate component="p" className="pb-10" content="filters.summary.introduction" />
                    <GroupedSelectedFilters />
                    <Translate component="p" content="filters.summary.remove" />
                  </div>
                :
                  <div>
                    <Translate component="p" className="pb-10" content="filters.summary.noFilters" />
                    <Translate component="p" content="filters.summary.close" unsafe />
                  </div>
                }
              </section>
              <div className="modal-card-foot">
                <button className="button is-light" onClick={toggleSummary}>
                  <Translate content="close" />
                </button>
              </div>
            </div>
          </div>
        }

        {showAdvancedSearch &&
          <div className="modal is-active">
            <div className="modal-background" />
            <div className="modal-card">
              <div className="modal-card-head">
                <Translate component="p" className="modal-card-title" content="advancedSearch.label" />
                <button className="delete" aria-label="close" onClick={this.props.toggleAdvancedSearch} />
              </div>
              <section className="modal-card-body">
                <Translate component="p" className="pb-10" content="advancedSearch.introduction" />
                {Header.generateTranslatedParagraph("advancedSearch.and")}
                {Header.generateTranslatedParagraph("advancedSearch.or")}
                {Header.generateTranslatedParagraph("advancedSearch.negates")}
                {Header.generateTranslatedParagraph("advancedSearch.phrase")}
                {Header.generateTranslatedParagraph("advancedSearch.prefix")}
                {Header.generateTranslatedParagraph("advancedSearch.precedence")}
                {Header.generateTranslatedParagraph("advancedSearch.distance")}
                {Header.generateTranslatedParagraph("advancedSearch.slop")}
                <p className="pt-15">
                  <Translate component="strong" content="advancedSearch.escaping.heading" unsafe />
                </p>
                {Header.generateTranslatedParagraph("advancedSearch.escaping.content")}
                <p className="pt-15">
                  <Translate component="strong" content="advancedSearch.defaultOperator.heading" unsafe />
                </p>
                <Translate component="p" content="advancedSearch.defaultOperator.content"
                              with={{className: 'has-text-weight-semibold'}}
                              unsafe/>
              </section>
              <div className="modal-card-foot">
                <Translate component="button" className="button is-light" 
                              onClick={toggleAdvancedSearch} 
                              content="close"/>
              </div>
            </div>
          </div>
        }
      </header>
    );
  }

  /**
   * Returns a translatable \<p\> element with substitution enabled.
   * @param translationString the string to translate
   */
  private static generateTranslatedParagraph(translationString: string) {
    return <Translate component="p" content={translationString}
      with={{ className: 'tag is-light has-text-weight-semibold' }}
      unsafe />;
  }
}

export const mapStateToProps = (state: State) => {
  return {
    pathname: state.routing.locationBeforeTransitions.pathname,
    code: state.language.code,
    filters: state.search.query.post_filter,
    showFilterSummary: state.search.showFilterSummary,
    showMobileFilters: state.search.showMobileFilters,
    showAdvancedSearch: state.search.showAdvancedSearch,
    // Needed to refresh the total amount of studies
    totalStudies: state.search.totalStudies
  };
};

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    resetSearch: bindActionCreators(resetSearch, dispatch),
    toggleSummary: bindActionCreators(toggleSummary, dispatch),
    toggleMobileFilters: bindActionCreators(toggleMobileFilters, dispatch),
    toggleAdvancedSearch: bindActionCreators(toggleAdvancedSearch, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
