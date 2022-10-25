/* eslint-disable react/display-name */
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
import {FaQuestionCircle} from 'react-icons/fa';


export default (props: {content: JSX.Element | string}) => (
  <div className="dropdown is-hoverable is-right">
    <div className="dropdown-trigger">
      <button className="button" aria-haspopup="true">
        <FaQuestionCircle />
      </button>
    </div>
    <div className="dropdown-menu" role="menu">
      <div className="dropdown-content">
        <div className="dropdown-item">
          <p>{props.content}</p>
        </div>
      </div>
    </div>
  </div>
)
