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

import React, { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRefinementList,
  useCurrentRefinements,
  UseRefinementListProps
} from 'react-instantsearch';
import { debounce } from 'lodash';

interface CustomRefinementListProps extends UseRefinementListProps {
  classNames?: {
    searchBox?: string;
    checkbox?: string;
    list?: string;
    listItem?: string;
  };
  searchable?: boolean;
  disableTags?: boolean;
  limit?: number;
  showMore?: boolean;
  showMoreLimit?: number;
}

const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(' ');

const CustomRefinementList = ({
  classNames = {},
  attribute,
  disableTags = false,
  limit = 10,
  showMore = false,
  showMoreLimit = 100,
  ...props
}: CustomRefinementListProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>('');

  const {
    refine,
    items,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({
    attribute,
    limit,
    showMore,
    showMoreLimit,
    ...props
  });

  const { items: currentRefinements } = useCurrentRefinements();
  const selectedRefinements = currentRefinements.find(ref => ref.attribute === attribute)?.refinements || [];
  const selectedLabels = new Set(selectedRefinements.map(item => item.label));

  const availableRefinements = disableTags
    ? items
    : items.filter(item => !selectedLabels.has(item.label));

  const visibleRefinements = useMemo(() => {
    if (query) {
      return availableRefinements.slice(0, showMoreLimit);
    }
    return availableRefinements.slice(0, isShowingMore ? showMoreLimit : limit);
  }, [availableRefinements, query, isShowingMore, limit, showMoreLimit]);

  const debouncedSearch = useRef(
    debounce((value: string) => {
      searchForItems(value);
    }, 200)
  ).current;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleRefine = (value: string | number) => {
    refine(String(value));
    setQuery('');
    inputRef.current?.focus();
  };

  const handleResetSearch = () => {
    setQuery('');
    searchForItems('');
    inputRef.current?.focus();
  };

  const clearAll = () => {
    selectedRefinements.forEach(item => refine(String(item.value)));
    setQuery('');
    searchForItems('');
  };

  const formatHighlight = (highlighted: string) =>
    highlighted
      .replace(/<ais-highlight-\d+>/g, '<mark>')
      .replace(/<\/ais-highlight-\d+>/g, '</mark>');

  return (
    <div className="ais-RefinementList" data-testid="custom-refinement-list">
      {/* Search Box */}
      {props.searchable && (
        <div className={cx('ais-RefinementList-searchBox focus-visible', classNames.searchBox)}>
          <div className="ais-SearchBox">
            <form className="ais-SearchBox-form" role="search" noValidate onSubmit={(e) => e.preventDefault()}>
              <input
                ref={inputRef}
                type="search"
                className="ais-SearchBox-input"
                placeholder=""
                value={query}
                onChange={(e) => handleQueryChange(e.currentTarget.value.toLowerCase())}
              />
              {query && (
                <button
                  type="reset"
                  className="ais-SearchBox-reset"
                  title={t('filters.clear')}
                  onClick={handleResetSearch}
                >
                  <svg className="ais-SearchBox-resetIcon" viewBox="0 0 20 20" width="10" height="10" aria-hidden="true">
                    <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Selected Filter options as Tags */}
      {!disableTags && selectedRefinements.length > 0 && (
        <div className="ais-RefinementList-selectedTags mb-2">
          <button className="ais-ClearRefinements-button ml-1" onClick={clearAll}>
            {t("filters.clear")}
          </button>
          <div className="is-flex is-flex-wrap-wrap selected-filters-container">
            {selectedRefinements.map(item => (
              <button
                key={item.label}
                onClick={() => handleRefine(item.value)}
                className="ais-RefinementList-label selected-filters-button"
                title={item.label}
              >
                <span className="selected-filters-label">{item.label}</span>
                <span>✕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter options */}
      <ul className={cx('ais-RefinementList-list', classNames.list)}>
        {visibleRefinements.map((item, index) => {
          const inputId = `refinement-${attribute}-${index}`;
          return (
            <li
              key={item.label}
              className={cx(
                'ais-RefinementList-item',
                item.isRefined && 'ais-RefinementList-item--selected',
                classNames.listItem
              )}
            >
              <label className="ais-RefinementList-label" htmlFor={inputId}>
                <input
                  id={inputId}
                  type="checkbox"
                  className={cx('ais-RefinementList-checkbox', 'focus-visible', classNames.checkbox)}
                  checked={item.isRefined}
                  onChange={() => handleRefine(item.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRefine(item.value);
                    }
                  }}
                />
                <span
                  className="ais-RefinementList-labelText"
                  dangerouslySetInnerHTML={{
                    __html: query && item.highlighted ? formatHighlight(item.highlighted) : item.label
                  }}
                />
                <span className="ais-RefinementList-count">{item.count}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Show More / Less */}
      {showMore && !query && canToggleShowMore && (
        <button className="ais-RefinementList-showMore" onClick={toggleShowMore}>
          {isShowingMore ? t('filters.showLess') : t('filters.showMore')}
        </button>
      )}
    </div>
  );
};

export default CustomRefinementList;
