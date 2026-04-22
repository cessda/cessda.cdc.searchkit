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

import {
  useSearchBox,
  usePagination,
  useHitsPerPage,
  useRange,
  UseRangeProps,
  useRefinementList,
  UseRefinementListProps,
  useSortBy,
  UseSortByProps
} from 'react-instantsearch';
import { HITS_OPTIONS } from '../../common/constants'


export const VirtualSearchBox = () => {
  useSearchBox();
  return null;
};

export const VirtualPagination = () => {
  usePagination();
  return null;
};

export const VirtualHitsPerPage = () => {
  useHitsPerPage({
    items: HITS_OPTIONS,
  });

  return null;
};

function VirtualRefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}

function VirtualRangeInput(props: UseRangeProps) {
  useRange(props);
  return null;
}

function VirtualSortBy(props: UseSortByProps) {
  useSortBy(props);
  return null;
}

export { VirtualRefinementList, VirtualRangeInput, VirtualSortBy };
