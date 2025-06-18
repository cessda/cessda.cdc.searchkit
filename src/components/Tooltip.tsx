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

import React, { useState, useRef } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

export interface TooltipProps {
  content: string;
  id?: string;
  classNames?: { container?: string, button?: string, content?: string, item?: string };
  ariaLabel?: string;
}

const Tooltip = ({ content, id, classNames, ariaLabel }: TooltipProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const tooltipButtonRef = useRef<HTMLButtonElement>(null);
  const minDistanceFromBottom = 200;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (event: React.FocusEvent) => {
    const nextFocused = event.relatedTarget as HTMLElement | null;
    if (!containerRef.current?.contains(nextFocused)) {
      deactivateTooltip();
    }
  };

  const calculatePosition = () => {
    if (tooltipButtonRef.current) {
      const rect = tooltipButtonRef.current.getBoundingClientRect();
      setIsNearBottom(window.innerHeight - rect.bottom < minDistanceFromBottom);
    }
  };

  const activateTooltip = () => {
    calculatePosition();
    setIsActive(true);
  };

  const deactivateTooltip = () => {
    setIsActive(false);
  };

  const toggleTooltip = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isActive) calculatePosition();
    setIsActive(!isActive);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isActive) {
      event.preventDefault();
      event.stopPropagation();
      deactivateTooltip();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`dropdown pe-none is-right ${classNames?.container || ''}${isActive ? ' is-active' : ''}`}
      onBlur={handleBlur}
      data-testid="tooltip-container"
    >
      <div className="dropdown-trigger">
        <button
          ref={tooltipButtonRef}
          className={`button focus-visible ${classNames?.button || ''}`}
          aria-haspopup="true"
          {...(isActive ? { 'aria-describedby': id } : { 'aria-label': ariaLabel })}
          onClick={toggleTooltip}
          onKeyDown={handleKeyDown}
          data-testid="tooltip-button"
        >
          <FaQuestionCircle className="tooltip-icon" aria-hidden="true" data-testid="tooltip-icon"
            onMouseEnter={activateTooltip}
            onMouseLeave={deactivateTooltip} />
        </button>
      </div>

      {isActive && (
        <div
          className={`dropdown-menu tooltip-content ${isNearBottom ? 'tooltip-above' : 'tooltip-below'}`}
          data-testid="tooltip-content"
          onMouseEnter={activateTooltip}
          onMouseLeave={deactivateTooltip}
        >
          <div className={`dropdown-content ${classNames?.content || ''}`}>
            <div
              id={id}
              className={`dropdown-item ${classNames?.item || ''}`}
              role="tooltip"
              aria-hidden={isActive ? 'false' : 'true'}
            >
              <p dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
