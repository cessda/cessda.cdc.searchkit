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

import React, { useState } from "react";

export interface Props {
  children: React.JSX.Element | React.JSX.Element[];
  title?: React.JSX.Element | string;
  tooltip?: React.JSX.Element | string;
  className?: string,
  collapsable?: boolean,
  defaultCollapsed?: boolean,
}

const Panel = (props: Props) => {
  const [collapsed, setCollapsed] = useState(props.defaultCollapsed ? props.defaultCollapsed : false);

  const { title, children, collapsable, tooltip } = props;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // If panels contain elements that shouldn't toggle collapse for the container, they need to be excluded here (like 'a' and 'button')
    if ((event.key === 'Enter' || event.key === ' ') &&
        !['a', 'button', 'ul', 'li', 'input'].includes((event.target as HTMLElement).tagName.toLowerCase())) {
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(!collapsed);
    }
  };

  return (
    <section className={'panel-container' + (collapsable ? ' collapsable' : '')}
            tabIndex={collapsable ? 0 : -1}
            onKeyDown={collapsable ? (e) => handleKeyDown(e) : undefined }
            data-testid='panel-container'>
      {tooltip}
      <div className={'panel-header' + (collapsable ? ' collapsable' : '') + (collapsed ? ' collapsed' : '')}
          onClick={collapsable ? () => setCollapsed(collapsed => !collapsed) : undefined }
          data-testid='panel-header'>
        <div className='panel-title'>{title}</div>
      </div>
      <div className={'panel-content' + (collapsable ? ' collapsable' : '') + (collapsed ? ' collapsed' : '')}
          data-testid='panel-content'>
        {children}
      </div>
    </section>
  );
}

export default Panel;
