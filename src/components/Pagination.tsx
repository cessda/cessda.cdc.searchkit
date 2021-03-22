
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

import React from 'react';
import {FaChevronLeft, FaChevronRight, FaEllipsisH} from 'react-icons/lib/fa/index';
import {connect} from 'react-redux';
import {AbstractItemList} from 'searchkit';

type Props = {
  items: {
    key: string | number;
    label: string;
    page: number;
  }[];
  selectedItems: number[];
  setItems: (arg0: number[]) => void;
};

export class Pagination extends AbstractItemList<Props> {

  render() {
    const {items, selectedItems, setItems} = this.props;
    let links = [];

    for (let i: number = 0; i < items.length; i++) {
      if (i === 0 || i === items.length - 1) {
        continue;
      }
      if (items[i].label === '...') {
        links.push(
          <li key={items[i].key}>
            <span className="pagination-ellipsis"><FaEllipsisH/></span>
          </li>
        );
      } else {
        const current = items[i].page === selectedItems[0] ? ' is-current' : '';
        links.push(
          <li key={items[i].key}>
            <a className={'pagination-link' + current}
               href={'/?p=' + items[i].page}
               onClick={(e) => {e.preventDefault(); setItems([items[i].page]);}}>
              {items[i].label}
            </a>
          </li>
        );
      }
    }

    return (
      <nav className="pagination is-centered is-small" role="navigation" aria-label="pagination">
        <a className="pagination-previous"
           href={'/?p=' + items[0].page}
           onClick={(e) => {e.preventDefault(); setItems([items[0].page]);}}>
          <FaChevronLeft/>
        </a>
        <a className="pagination-next"
           href={'/?p=' + items[items.length - 1].page}
           onClick={(e) => {e.preventDefault(); setItems([items[items.length - 1].page]);}}>
          <FaChevronRight/>
        </a>
        <ul className="pagination-list">
          {links}
        </ul>
      </nav>
    );
  }
}

export default connect()(Pagination);
