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

import express from "express";
import { logger } from "./logger";
import fetch from 'node-fetch';

const SKOSMOS_URL = process.env.SEARCHKIT_SKOSMOS_URL || "https://thesauri.cessda.eu";
const ELSST_VOCABULARY = process.env.SEARCHKIT_ELSST_VOCABULARY || "elsst-4";
const ELSST_URI_PREFIX = process.env.SEARCHKIT_ELSST_URI_PREFIX || "https://elsst.cessda.eu/id/4/";

interface SkosmosLookupResponse {
  result: {
    uri: string;
  }[];
}

export interface TermURIResult extends Record<string, string> {}

/**
 * Cache for ELSST terms
 */
const termCache = new Map<string, string | null>();

async function getELSSTTerm(labels: string[], lang: string): Promise<TermURIResult> {


  const termUris = labels.map(async originalLabel => {
    // Normalise the label by converting it to upper case
    const normalisedLabel = originalLabel.toUpperCase();

    // Because the cache can store 'undefined' as a value, we can't use `if(termCache.get(term))` to test for cache presence
    if(termCache.has(normalisedLabel)) {
      return {
        label: originalLabel, // UI expects the original label
        uri: termCache.get(normalisedLabel)
      };
    }

    // Request term from ELSST, the label is encoded
    const response = await fetch(`${SKOSMOS_URL}/rest/v1/${ELSST_VOCABULARY}/lookup?label=${encodeURIComponent(normalisedLabel)}&lang=${lang}`);

    // Match potentially found - try to extract the URI
    if (response.ok) {
      const results = await response.json() as SkosmosLookupResponse;
      if (results.result.length > 0) {
        // Check uri from result if it contains known prefix to change it and add clang parameter
        let resultUri = results.result[0].uri;
        if(resultUri.includes(ELSST_URI_PREFIX)) {
          const resultUriUuid = resultUri.replace(ELSST_URI_PREFIX, '');
          resultUri = `${SKOSMOS_URL}/${ELSST_VOCABULARY}/en/page/${resultUriUuid}?clang=${lang}`;
        }

        // Write the result to the cache
        termCache.set(normalisedLabel, resultUri);

        return {
          label: originalLabel,
          uri: resultUri
        };
      }
    } else if (response.status === 404) {
      // If a 404 response is returned, the term doesn't exist in ELSST
      termCache.set(normalisedLabel, null);
    }

    // Match not found
    return {
      label: originalLabel, // UI expects the original label
      uri: undefined
    };
  });


  const destObject: TermURIResult = {}

  // Copy each result into the destination object, awaiting each in turn
  for (const promise of termUris) {
    const termResult = await promise;
    if (termResult.uri) {
      destObject[termResult.label] = termResult.uri;
    }
  }

  return destObject;
}

export function getELSSTRouter() {
  const router = express.Router();

  router.post('/_terms', async (req, res) => {
    const terms = req.body as {
      labels: string[],
      lang: string
    };

    try {
      const lookup = await getELSSTTerm(terms.labels, terms.lang);
      res.json(lookup);
    } catch (e) {
      logger.error('ELSST request failed: %s', e);
      res.sendStatus(502);
    }
  });

  return router;
}
