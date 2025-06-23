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

import React, { useEffect } from "react";
import {
  Hits,
  ClearRefinements,
  Stats,
  HitsPerPage,
  SortBy,
  CurrentRefinements,
  useCurrentRefinements,
  RangeInput,
} from "react-instantsearch";
import Result from "../components/Result";
import ToggleButtons from "../components/ToggleButtons";
import Pagination from "../components/Pagination";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../hooks";
import { toggleMobileFilters, toggleSummary } from "../reducers/search";
import Panel from "../components/Panel";
import Tooltip from "../components/Tooltip";
import { useSearchParams } from "react-router";
import { TFunction } from "i18next";
import { Hit } from "instantsearch.js";
import { CMMStudy } from "../../common/metadata";
import CustomRefinementList from "../components/CustomRefinementList";
import { FaRegCheckSquare } from "react-icons/fa";


const hitsPerPageItems = [
  { value: 10, label: 'Show 10' },
  { value: 30, label: 'Show 30', default: true },
  { value: 50, label: 'Show 50' },
  { value: 150, label: 'Show 150' },
]

const getSortByItems = (index: string, t: TFunction<"translation", undefined>) => {
  return [
    { value: `${index}`, label: t("sorting.relevance") },
    { value: `${index}_title_asc`, label: t("sorting.titleAscending") },
    { value: `${index}_title_desc`, label: t("sorting.titleDescending") },
    { value: `${index}_collection_date_desc`, label: t("sorting.dateDescending") },
    { value: `${index}_collection_date_asc`, label: t("sorting.dateAscending") },
    { value: `${index}_publication_year_desc`, label: t("sorting.publicationDateDescending") },
    { value: `${index}_publication_year_asc`, label: t("sorting.publicationDateAscending") },
  ];
};

const SearchPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);
  const toggleSummaryRef = React.createRef() as React.RefObject<HTMLButtonElement>;
  const showFilterSummary = useAppSelector((state) => state.search.showFilterSummary);
  const showMobileFilters = useAppSelector((state) => state.search.showMobileFilters);
  const sortByItems = getSortByItems(currentIndex.indexName, t);

  const [searchParams] = useSearchParams();
  const sortByParam = searchParams.get('sortBy');
  useEffect(() => {
    // Check if language needs to be updated
    // Assumes that the index name from sortBy has language tag as the second part when split by underscore
    if (sortByParam && sortByParam !== currentIndex.indexName) {
      //    dispatch(updateLanguage(sortByParam?.split('_')[1]));
    } else if (!sortByParam && currentIndex.indexName.split('_')[1] !== 'en') {
      // Update language if sortBy is false but language is still something other than default (en)
      //  dispatch(updateLanguage('en'));
    }
  }, [sortByParam]);
  // TODO Gives off a warning when changing language through sortBy query parameter, e.g. clicking on keyword/topic on Detail page
  // "[InstantSearch.js]: The index named "coordinate_en" is not listed in the `items` of `sortBy`."
  // Fixed Similar warning on pages that are not the search page ("/") by adding a virtualSortBy with all the possible options

  // useEffect(() => {
  //   dispatch(updateTotalStudies());
  // }, []);

  const { items } = useCurrentRefinements();
  const hasRefinements = items.length > 0;
  const refinedAttributes = items.map(item => item.attribute);
  const isRefined = (attribute: string) => refinedAttributes.includes(attribute);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.click();
      }
    }
  }

  function focusToggleSummary() {
    if (toggleSummaryRef.current) {
      toggleSummaryRef.current.focus();
    }
  }

  const HitComponent = ({ hit }: { hit: Hit<CMMStudy & Record<string, unknown>> }) => {
    return <Result key={hit.objectID} hit={hit} />;
  };

  return (

    <div className={'columns layout mt-4' + (showMobileFilters ? ' show-mobile-filters' : '')}>

      <div className="column is-8 is-hidden-tablet pt-0">
        <button className={'ais-ClearRefinements-button focus-visible' + (!showFilterSummary ? ' on-top' : '')}
          onClick={() => dispatch(toggleMobileFilters(showMobileFilters))}
          onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e)}>
          {showMobileFilters ? t("hideFilters") : t("showFilters")}
        </button>
      </div>
      <div className="column is-4 filters pt-0 pb-10">
        <div className="filter-wrapper">

          <div className="columns is-vcentered is-gapless m-0 is-flex is-mobile filter-buttons">
            <div className="column">
              <h2 className="filters">{t("filters.label")}</h2>
            </div>
            <div className="column is-narrow columns is-gapless is-mobile mr-4">
              <div className="column is-narrow mt-1 mr-2">
                <button className="ais-ClearRefinements-button focus-visible"
                  onClick={() => dispatch(toggleSummary(showFilterSummary))}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e)}
                  disabled={!hasRefinements}
                  ref={toggleSummaryRef}
                  data-testid="filter-summary-button">
                  {t("filters.summary.label")}
                </button>
                {showFilterSummary && (
                  <div className="modal is-active" data-testid="filter-summary">
                    <div className="modal-background" />
                    <div className="modal-card">
                      <div className="modal-card-head">
                        <h2 className="modal-card-title">{t("filters.summary.label")}</h2>
                        <button className="delete focus-visible"
                          aria-label="close"
                          onClick={() => { dispatch(toggleSummary(showFilterSummary)); focusToggleSummary(); }}
                          autoFocus data-testid="close-filter-summary" />
                      </div>
                      <section className="modal-card-body">
                        {hasRefinements ? (
                          <>
                            <p className="pb-10">{t("filters.summary.introduction")}</p>
                            <CurrentRefinements />
                            <p dangerouslySetInnerHTML={{ __html: t('filters.summary.remove') }} />
                          </>
                        ) : (
                          <>
                            <p className="pb-10">{t("filters.summary.noFilters")}</p>
                          </>
                        )}
                        <p dangerouslySetInnerHTML={{ __html: t('filters.summary.close') }} />
                      </section>
                      <div className="modal-card-foot">
                        <button className="button is-info focus-visible"
                          onClick={() => { dispatch(toggleSummary(showFilterSummary)); focusToggleSummary(); }}>
                          {t("close")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="column is-narrow mt-1">
                <ClearRefinements
                  classNames={{
                    root: '',
                    button: 'focus-visible',
                  }}
                  translations={{
                    resetButtonText: t("reset.filters")
                  }}
                />
              </div>
            </div>
          </div>
          <div className="filter-panels">

            {(!currentThematicView.excludeFilters.includes('topic') && !currentIndex.excludeFilters.includes('topic')) &&
              <Panel
                title={
                  <h2>
                    {t("filters.topic.label")}
                    {isRefined("classifications") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-topic-tooltip"
                  content={t("filters.topic.tooltip.content")}
                  ariaLabel={t("filters.topic.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="classifications" searchable limit={15}
                  classNames={{
                    list: 'ais-CustomRefinementList',
                    listItem: 'ais-CustomRefinementList-item',
                  }} />
              </Panel>
            }

            {(!currentThematicView.excludeFilters.includes('keywords') && !currentIndex.excludeFilters.includes('keywords')) &&
              <Panel
                title={
                  <h2>
                    {t("filters.keywords.label")}
                    {isRefined("keywords") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-keywords-tooltip"
                  content={t("filters.keywords.tooltip.content")}
                  ariaLabel={t("filters.keywords.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="keywords" searchable limit={15}
                  classNames={{
                    list: 'ais-CustomRefinementList',
                    listItem: 'ais-CustomRefinementList-item',
                  }} />
              </Panel>
            }

            {(!currentThematicView.excludeFilters.includes('dataAccess') && !currentIndex.excludeFilters.includes('dataAccess')) &&
              <Panel
                title={
                  <h2>
                    {t("filters.dataAccess.label")}
                    {isRefined("dataAccess") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-dataaccess-tooltip"
                  content={t("filters.dataAccess.tooltip.content")}
                  ariaLabel={t("filters.dataAccess.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="dataAccess" disableTags />
              </Panel>
            }

            {(!currentThematicView.excludeFilters.includes('collectionYear') && !currentIndex.excludeFilters.includes('collectionYear')) &&
              <Panel
                title={
                  <h2>
                    {t("metadata.collectionYear")}
                    {isRefined("collectionYear") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-collectiondates-tooltip"
                  content={t("filters.collectionDates.tooltip.content")}
                  ariaLabel={t("filters.collectionDates.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <RangeInput
                  attribute="collectionYear"
                  classNames={{
                    form: 'is-flex is-flex-wrap-wrap gap-2 ml-3',
                    input: 'focus-visible',
                    submit: 'focus-visible ml-0'
                  }}
                  translations={{
                    separatorElementText: `${t("filters.collectionYear.separator")}`,
                    submitButtonText: `${t("filters.collectionYear.submitButton")}`,
                  }}
                />
              </Panel>
            }

            {(!currentThematicView.excludeFilters.includes('country') && !currentIndex.excludeFilters.includes('country')) &&
              <Panel
                title={
                  <h2>
                    {t("metadata.country")}
                    {isRefined("country") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-country-tooltip"
                  content={t("filters.country.tooltip.content")}
                  ariaLabel={t("filters.country.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="country" searchable sortBy={['name:asc']} limit={200} showMore={false} showMoreLimit={500}
                  classNames={{
                    list: 'ais-CustomRefinementList',
                    listItem: 'ais-CustomRefinementList-item-alt',
                  }} />
              </Panel>
            }

            {(!currentThematicView.excludeFilters.includes('publisher') && !currentIndex.excludeFilters.includes('publisher')) &&
              <Panel
                title={
                  <h2>
                    {t("metadata.publisher")}
                    {isRefined("publisher") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-publisher-tooltip"
                  content={t("filters.publisher.tooltip.content")}
                  ariaLabel={t("filters.publisher.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="publisher" searchable sortBy={['name:asc']} limit={40} showMore={true} showMoreLimit={100} />
              </Panel>
            }

            {/* Add switch to toggle between values from CV (id) and non-CV (term)? */}

            {(!currentThematicView.excludeFilters.includes('timeMethod') && !currentIndex.excludeFilters.includes('timeMethod')) &&
              <Panel
                title={
                  <h2>
                    {t("metadata.timeMethod")}
                    {isRefined("timeMethod") && <span className="icon is-small ml-1"><FaRegCheckSquare /></span>}
                  </h2>
                }
                tooltip={<Tooltip id="filters-timemethod-tooltip"
                  content={t("filters.timeMethod.tooltip.content")}
                  ariaLabel={t("filters.timeMethod.tooltip.ariaLabel")} />}
                collapsable={true}
                defaultCollapsed={true}>
                <CustomRefinementList attribute="timeMethod" searchable limit={16} showMore showMoreLimit={100}
                  classNames={{
                    list: 'ais-CustomRefinementList',
                    listItem: 'ais-CustomRefinementList-item',
                  }} />
              </Panel>
            }

          </div>
        </div>
      </div>
      <div className="column is-8 pt-0">






        <div className="hits-wrapper">

          <div className="columns is-vcentered ais-Stats-Dropdowns">

            <div className="column is-narrow ml-4 p-0">
              <Stats />
            </div>
            <div className="column is-7">
              <div className="columns is-vcentered is-flex is-flex-wrap-wrap">
                <div className="column is-5">
                  <HitsPerPage items={hitsPerPageItems}
                    classNames={{
                      select: 'focus-visible',
                    }} />
                </div>
                <div className="column is-7">
                  <SortBy items={sortByItems}
                    classNames={{
                      select: 'focus-visible'
                    }} />
                </div>
              </div>
            </div>


          </div>
          <Pagination />
          <div className="columns my-0 py-0">
            <div className="column is-12 mt-2 pl-4 ml-3 mb-0 pb-0">
              <ToggleButtons />
            </div>
          </div>
          <Hits hitComponent={HitComponent} />
          <Pagination />
        </div>
      </div>
    </div>
  )
};

export { hitsPerPageItems, getSortByItems };
export default SearchPage;
