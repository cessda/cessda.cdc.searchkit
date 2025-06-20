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

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstantSearch, useSearchBox, UseSearchBoxProps } from 'react-instantsearch';
import { useNavigate, useSearchParams } from 'react-router';
import { useAppSelector, useAppDispatch } from "../hooks";
import { Helmet } from "react-helmet-async";
import { clearSearchFormReset } from "../reducers/search";

interface CustomSearchBoxProps extends UseSearchBoxProps {
  setQueryError: (msg: string | null) => void;
}

const getQueryValidationError = (query: string): string | null => {
  const MAX_QUERY_LENGTH = 500;
  const trimmed = query.trim();

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return `Search query is too long (max ${MAX_QUERY_LENGTH} characters).`;
  }

  if (/^[*?]+$/.test(trimmed)) {
    return "Search query cannot consist only of wildcards.";
  }

  const stack: string[] = [];
  for (const char of trimmed) {
    if (char === '(') stack.push(char);
    else if (char === ')') {
      if (stack.pop() !== '(') return "Unmatched closing parenthesis.";
    }
  }

  if (stack.length !== 0) return "Unmatched opening parenthesis.";

  const quoteCount = (trimmed.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) return "Unmatched quotation mark.";

  return null;
};

const CustomSearchBox = ({ setQueryError, ...props }: CustomSearchBoxProps) => {
  const currentThematicView = useAppSelector((state) => state.thematicView.currentThematicView);
  const shouldReset = useAppSelector((state) => state.search.shouldResetSearchForm);
  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { query, refine } = useSearchBox(props);
  const { status } = useInstantSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const isSearchStalled = status === 'stalled';

  function setNewQuery(newQuery: string) {
    if (location.pathname !== currentThematicView.path) {
      navigate(`${currentThematicView.path}?query=${newQuery}`);
    }
    refine(newQuery);
  }

  useEffect(() => {
    if (shouldReset) {
      setInputValue('');
      dispatch(clearSearchFormReset());
    }
  }, [shouldReset]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
    setQueryError(null); // Clear error on input change
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit(event as unknown as React.FormEvent);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const error = getQueryValidationError(inputValue);
    if (error) {
      setQueryError(error);
      return;
    }

    setQueryError(null);
    setNewQuery(inputValue);
    inputRef.current?.blur();
  };

  const pageTitle = searchParams.get("query")
    ? `${currentThematicView.longTitle} - search results for "${searchParams.get("query")}"`
    : currentThematicView.longTitle;

  return (
    <form
      action={currentThematicView.path}
      role="search"
      noValidate
      id="searchform"
      onSubmit={handleSubmit}
      onReset={(event) => {
        event.preventDefault();
        event.stopPropagation();

        setInputValue('');
        setNewQuery('');
        setQueryError(null);

        // Make sure location.search.query is also reset
        setSearchParams((searchParams) => {
          const queryParamsObject: { [key: string]: string } = {};
          searchParams.forEach((value, key) => {
            queryParamsObject[key] = value;
          });
          delete queryParamsObject['query'];
          return new URLSearchParams(queryParamsObject);
        });

        inputRef.current?.focus();
      }}
    >
      <div className="columns is-narrow is-gapless">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <div className="column is-narrow is-narrow-mobile">
          <input
            className="input searchbox"
            id="searchbox"
            aria-label="Search field"
            ref={inputRef}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Search in selected language"
            spellCheck={false}
            maxLength={512}
            type="search"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            className={`button ${isSearchStalled ? 'is-loading' : ''}`}
            type="submit"
          >
            {t("search.label")}
          </button>
        </div>
        <div className="column is-narrow is-flex-grow-0 ml-1 is-hidden-mobile">
          <button
            className="button"
            disabled={inputValue === '' || isSearchStalled}
            type="reset"
          >
            {t("search.reset")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CustomSearchBox;
