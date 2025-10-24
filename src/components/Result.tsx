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

import React, { useEffect, useState } from "react";
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt,  FaLock, FaLockOpen } from 'react-icons/fa';
import { Link, useLocation } from "react-router";
import { CMMStudy, TermVocabAttributes } from "../../common/metadata";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks";
import Keywords from "./Keywords";
import { Hit, HitAttributeHighlightResult } from "instantsearch.js";
import getPaq from "../utilities/getPaq";
import MetadataUtils from "../utilities/metadata";
import { escapeRegex } from "../../common/utils";

function generateCreatorElements(item: CMMStudy) {
  const creators: React.JSX.Element[] = [];
  // How many creators should be shown
  const creatorsLength = 3;

  if (item.creators) {
    for (let i = 0; i < item.creators.length; i++) {
      creators.push(
        <span key={i}>
          {item.creators[i].affiliation ? (
            `${item.creators[i].name} (${item.creators[i].affiliation})`
          ) : (
            item.creators[i].name
          )}
          {i < item.creators.length - 1 ? "; " : ""}
        </span>
      );

      if (i === 2 && item.creators.length > creatorsLength) {
        creators.push(<span key={3}>({item.creators.length - creatorsLength} more)</span>);
        break;
      }
    }
  }

  return creators;
}

interface ResultProps {
  hit: Hit<CMMStudy & Record<string, unknown>>;
}

const Result: React.FC<ResultProps> = ({ hit }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentIndex = useAppSelector((state) => state.thematicView.currentIndex);
  const showAbstract = useAppSelector((state) => state.search.showAbstract);
  const showKeywords = useAppSelector((state) => state.search.showKeywords);

  const [abstractExpanded, setAbstractExpanded] = useState(false);
  const [sortedKeywords, setSortedKeywords] = useState<TermVocabAttributes[]>([]);

  useEffect(() => {
    if (hit.keywords && hit.keywords.length > 0) {
      setSortedKeywords(hit.keywords.sort((a, b) => a.term.localeCompare(b.term)));
    }
  }, [hit.keywords]);

  const truncatedAbstractLength = 500;
  const truncatedKeywordsLength = 7;

  const languages: JSX.Element[] = [];
  for (let i = 0; i < hit?.langAvailableIn?.length; i++) {
    languages.push(
      <Link
        key={i}
        className="button is-small is-white mln-5 focus-visible"
        to={`detail/${hit.objectID}?lang=${hit.langAvailableIn[i].toLowerCase()}`}
        state={{ from: location.pathname }}
      >
        {hit.langAvailableIn[i].toUpperCase()}
      </Link>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent, titleStudy: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      handleAbstractExpansion(titleStudy);
    }
  }

  const handleClick = (event: React.MouseEvent, titleStudy: string) => {
    event.preventDefault();
    event.stopPropagation();
    handleAbstractExpansion(titleStudy);
  };

  const handleAbstractExpansion = (titleStudy: string) => {
    // Notify Matomo Analytics of toggling "Read more" for a study
    const _paq = getPaq();
    _paq.push(['trackEvent', 'Search', 'Read more', titleStudy]);

    setAbstractExpanded(!abstractExpanded)
  }

  const renderAbstract = () => {
    let abstract = MetadataUtils.normalizeAndDecodeHTML(hit.abstract);
    const matchedWords = (hit._highlightResult?.abstract as HitAttributeHighlightResult)?.matchedWords || [];
    if (matchedWords.length > 0) {
      if (abstractExpanded) {
        // Create a regular expression that matches any of the highlighted texts.
        // Any RegEx control characters are escaped. The RegEx is case insensitive.
        const regexString = matchedWords
          .map((text: string) => escapeRegex(text))
          .map((text: string) => `(${text})`).join('|');
        const regex = new RegExp(regexString, 'gi');

        // Use the regular expression to find and highlight all matching texts in the full abstract
        abstract = abstract.replace(regex, (match: string) => `<mark>${match}</mark>`);
      } else {
        abstract = MetadataUtils.normalizeAndDecodeHTML((hit._highlightResult!.abstract as HitAttributeHighlightResult).value);
      }
    }

    // Make sure abstract is not longer than set limit but don't slice in the middle of the word
    if (!abstractExpanded) {
      const abstractTruncated = abstract.length <= truncatedAbstractLength ? abstract
        : abstract.slice(0, abstract.lastIndexOf(' ', truncatedAbstractLength)) + '...';

      // Invoke the HTML parser to close any unclosed tags
      const docFragment = new DOMParser().parseFromString(abstractTruncated, "text/html");
      return docFragment.body.innerHTML;
    } else {
      return abstract;
    }
  };

  const creators = generateCreatorElements(hit);

  return (
    <div className="list-hit" data-qa="hit">
   
      <h2 className="title is-6">
        <Link className="focus-visible"
        key={hit.objectID}
          to={`detail/${hit.objectID}?lang=${currentIndex.languageCode}`}
          state={{ from: location.pathname }}>
          <span dangerouslySetInnerHTML={{ __html: (hit._highlightResult?.titleStudy as HitAttributeHighlightResult)?.value || hit.titleStudy }}></span>
        </Link>
      </h2>
      <div className="subtitle is-6">{creators}</div>
      {showAbstract && (
        <div className="abstract">
          <div dangerouslySetInnerHTML={{ __html: renderAbstract() }} />
        </div>
      )}
      {showKeywords && sortedKeywords.length > 0 &&
        <div className="result-keywords mt-10">
          <Keywords keywords={sortedKeywords} currentIndex={currentIndex.indexName} keywordLimit={truncatedKeywordsLength}
            lang={currentIndex.languageCode} isExpandDisabled={true} />
        </div>
      }
      <span className="level mt-10 result-actions">
        <span className="level-left is-hidden-touch">
          <div className="field is-grouped">
            <div className="control">
              {showAbstract && hit.abstract?.length > truncatedAbstractLength && (
                <a className="button no-border is-light focus-visible"
                  tabIndex={0}
                  onClick={(e) => handleClick(e, hit.titleStudy)}
                  onKeyDown={(e) => handleKeyDown(e, hit.titleStudy)}
                  data-testid="expand-abstract">
                  {abstractExpanded ? (
                    <>
                      <span className="icon is-small">
                        <FaAngleUp />
                      </span>
                      <span>{t("readLess")}</span>
                    </>
                  ) : (
                    <>
                      <span className="icon is-small">
                        <FaAngleDown />
                      </span>
                      <span>{t("readMore")}</span>
                    </>
                  )}
                </a>
              )}
            </div>
          </div>
        </span>
        <span className="level-right">
          <div className="field is-grouped is-flex-wrap-wrap">
            {languages.length > 0 && (
              <div className="control">
                <div className="buttons has-addons">
                  <span className="button no-border bg-w pe-none mln-5 mrn-5">
                    <span>{t("language.label")}:</span>
                  </span>
                  {languages}
                </div>
              </div>
            )}
            {hit.dataAccess && (hit.dataAccess === "Open" || hit.dataAccess === "Restricted") &&
              <div className="control">
                <span className="button is-small is-white bg-w pe-none mln-5 mrn-5">
                  {t("metadata.dataAccess")}:
                </span>
                <span className="button is-small is-white bg-w pe-none mrn-5">
                  {hit.dataAccess === "Open" ? (
                    <span className="icon is-small">
                      <FaLockOpen/>
                    </span>
                  ) : hit.dataAccess === "Restricted" && (
                    <span className="icon is-small">
                      <FaLock/>
                    </span>
                  )}
                  <span>{hit.dataAccess}</span>
                </span>

              </div>
            }
            <div className="control">
              {hit.studyUrl && (
                <a
                  className="button is-small is-white focus-visible"
                  href={hit.studyUrl}
                  rel="noreferrer"
                  target="_blank"
                  data-testid="study-url"
                >
                  <span className="icon is-small">
                    <FaExternalLinkAlt />
                  </span>
                  <span>{t("goToStudy")}</span>
                </a>
              )}
            </div>
          </div>
        </span>
      </span>
    </div>
  );
};

export default Result;
