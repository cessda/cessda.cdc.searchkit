// Copyright CESSDA ERIC 2017-2026
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

import { BASE_INDEX, SORT_OPTIONS } from "./constants";
import { thematicViews } from "./thematicViews";

/** Escape all characters in a regex */
const regexEscape = /[/\-\\^$*+?.()|[\]{}]/g;

export function escapeRegex(string: string) {
  return string.replace(regexEscape, "\\$&");
}

/**
 * Derive the base index from a sortBy field using the known suffixes
 * from {@link SORT_OPTIONS} to strip out sorting parameters.
 * 
 * @param sortBy the sortBy field.
 * @param fallback the fallback index if sortBy is empty or undefined, defaults to {@link BASE_INDEX}.
 * @returns the stripped sortBy, or {@link BASE_INDEX} if sortBy is empty.
 */
export function indexBaseFromSortBy(sortBy: string | undefined, fallback: string = BASE_INDEX) {
  if (!sortBy) return fallback;

  // If it ends with any known suffix, strip it
  for (const { suffix } of SORT_OPTIONS) {
    if (suffix && sortBy.endsWith(suffix)) {
      return sortBy.slice(0, -suffix.length);
    }
  }

  // Otherwise it should already be the index base/prefix
  return sortBy;
}

export function ensureSlash(p: string) {
  if (p.endsWith("/")) {
    return p;
  } else {
    return `${p}/`;
  }
}
}

export function isSearchRoute(pathname: string): boolean {
  return thematicViews.some((tv) => ensureSlash(tv.path) === pathname);
}

export function getCollectionPath(pathname: string): string {
  const path = ensureSlash(pathname);

  if (path === "/") {
    return "/";
  }

  const [, firstSegment] = path.split("/", 3);
  return firstSegment ? `/${firstSegment}` : "/";
}

export function buildSearchLink(indexName: string, params: URLSearchParams | string) {
  const [collection] = indexName.split("_");
  const isRoot = collection === BASE_INDEX.split("_")[0];

  const searchParams = new URLSearchParams(params);
  searchParams.set("sortBy", indexName);

  if (isRoot) {
    if (indexBaseFromSortBy(indexName, BASE_INDEX) === BASE_INDEX) {
      searchParams.delete("sortBy");
    }
    return {
      pathname: "/",
      search: searchParams.toString() ? `?${searchParams.toString()}` : ""
    };
  }

  return {
    pathname: ensureSlash(`/${collection}`),
    search: `?${searchParams.toString()}`
  };
}
