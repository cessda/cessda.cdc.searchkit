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

import React, { useState } from 'react';
import { FaAngleUp, FaAngleDown, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import striptags from "striptags";
import { Series } from "../../common/metadata";
import MetadataUtils from "../utilities/metadata";

const MAX_DESCRIPTION_LENGTH = 600;

/**
 * Helper function to truncate multiple descriptions to a combined length while
 * still keeping them separate.
 *
 * @param descriptions the series descriptions to truncate if needed
 * @param limit character limit before truncating
 * @returns array of truncated descriptions
 */
function truncateDescriptions(descriptions: string[], limit: number): string[] {
  const truncated: string[] = [];
  let totalLength = 0;

  for (const desc of descriptions) {
    const remainingLimit = limit - totalLength;
    if (remainingLimit <= 0) break;

    const truncatedDesc = desc.length > remainingLimit ? MetadataUtils.truncateText(desc, remainingLimit) : desc;

    truncated.push(truncatedDesc);
    totalLength += truncatedDesc.length;
  }

  return truncated;
}

/**
 * Render series names, URIs and descriptions. Supports series having multiple
 * names, URIs and descriptions.
 *
 * @param series series to render
 * @param lang language of metadata
 * @returns rendered series
 */
const SeriesDetail = ({ series }: { series: Series }) => {
  const { t } = useTranslation();
  const { names = [], descriptions = [], uris = [] } = series;
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  // Remove HTML tags from descriptions
  const sanitizedDescriptions = descriptions.map(desc => striptags(desc));

  const isLongDescription = sanitizedDescriptions.join('').length > MAX_DESCRIPTION_LENGTH;
  const displayedDescriptions = isLongDescription && !descriptionExpanded
    ? truncateDescriptions(sanitizedDescriptions, MAX_DESCRIPTION_LENGTH)
    : sanitizedDescriptions;

  const toggleDescription = () => setDescriptionExpanded(!descriptionExpanded);

  return (
    <div data-testid="series-detail">
      {(names.length > 0 || uris.length > 0) && (
        <>
          {/* Render names, linking to URIs if available */}
          {names.map((name, index) => (
            uris[index] ? (
              <p key={`name-${index}`}><a href={uris[index]} target="_blank" rel="noreferrer">
                <span className="icon"><FaExternalLinkAlt /></span>
                {name}
              </a></p>
            ) : (
              <p key={`name-${index}`}>{name}</p> // Name without link if no URI
            )
          ))}

          {/* Render remaining URIs if there are no names left to pair with */}
          {uris.length > names.length && uris.slice(names.length).map((uri, index) => (
            <p key={`uri-${index}`}><a href={uri} target="_blank" rel="noreferrer">
              <span className="icon"><FaExternalLinkAlt /></span>
              {uri}
            </a></p>
          ))}
        </>
      )}

      {/* Render descriptions with toggle for lengthy descriptions */}
      {descriptions.length > 0 && (
        <>
          <span>
            {displayedDescriptions.map((desc, i) => (
              <p key={i}>{desc}</p>
            ))}
          </span>

          {/* Show "Read more" / "Read less" button if truncation was applied */}
          {isLongDescription && (
            <a className="button is-small is-white" onClick={toggleDescription}>
              {descriptionExpanded ? (
                <>
                  <span className="icon is-small"><FaAngleUp /></span>
                  <span>{t("readLess")}</span>
                </>
              ) : (
                <>
                  <span className="icon is-small"><FaAngleDown /></span>
                  <span>{t("readMore")}</span>
                </>
              )}
            </a>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Loop through all the series in the series list and render them.
 *
 * @param seriesList all the series to render
 * @param lang language of metadata
 * @returns div for each series in the list or div for "Not available" if list is empty
 */
const SeriesList = ({ seriesList, lang }: {seriesList: Series[], lang: string}) => {
const { t } = useTranslation();
  return (
    <>
      {seriesList.length > 0 ? (
        seriesList.map((series, index) => (
          <div key={index} lang={lang}>
            <SeriesDetail series={series}/>
          </div>
        ))
      ) : (
        <div lang={lang}>
            {t("language.notAvailable.field")}
        </div>
      )}
    </>
  );
};

export default SeriesList;
