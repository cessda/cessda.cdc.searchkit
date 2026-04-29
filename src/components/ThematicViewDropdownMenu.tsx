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

import React, { useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router';
import { ThematicView } from '../../common/thematicViews';
import { useResetToThematicView } from "../utilities/thematicView";


export interface IndexDropdownMenuProps {
  currentKey: string;
  items: ThematicViewMenuItem[];
}

export interface ThematicViewMenuItem {
  view: ThematicView;
  icon: string;
}

const ThematicViewDropdownMenu = ({ currentKey, items }: IndexDropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const resetToView = useResetToThematicView();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prev => {
      if (!prev) setFocusedIndex(null);
      return !prev;
    });
  };

  const handleCollectionChange = (view: ThematicView) => {
    resetToView(view);
    setOpen(false);
    setFocusedIndex(null);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(null);
    }
  };

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    index: number
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex(prev =>
        prev! < items.length - 1 ? prev! + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex(prev =>
        prev! > 0 ? prev! - 1 : items.length - 1
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCollectionChange(items[index].view);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(null);
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  useEffect(() => {
    if (open && focusedIndex !== null) {
      const focusedItem = document.getElementById(
        `dropdown-item-${focusedIndex}`
      );
      focusedItem?.focus();
    }
  }, [focusedIndex, open]);

  return (
    <div className="is-relative" ref={menuRef}>
      <button
        ref={buttonRef}
        id="dropdown-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="dropdown-menu"
        type="button"
        className="button is-ghost has-text-weight-semibold focus-visible"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <span className="icon is-small mr-0">
          {open ? <FaAngleUp /> : <FaAngleDown />}
        </span>
        Collection
      </button>

      {open && (
        <div className="menu-dropdown">
          <ul
            role="menu"
            id="dropdown-menu"
            aria-labelledby="dropdown-button"
          >
            {items.map(({ view, icon }, index) => (
              <li
                role="menuitem"
                id={`dropdown-item-${index}`}
                key={view.key}
                className={
                  focusedIndex === index
                    ? 'columns is-mobile is-gapless mb-0 has-background-grey-lighter'
                    : 'columns is-mobile is-gapless mb-0'
                }
                tabIndex={focusedIndex === index ? 0 : -1}
                onKeyDown={event => handleItemKeyDown(event, index)}
              >
                <Link
                  to={view.path}
                  onClick={e => {
                    e.preventDefault();
                    handleCollectionChange(view);
                  }}
                  className={
                    currentKey === view.key
                      ? 'column columns is-mobile is-gapless is-vcentered tv-menu-item selected py-1'
                      : 'column columns is-mobile is-gapless is-vcentered tv-menu-item py-1'
                  }
                >
                  <div className="select-icon column is-narrow mx-3 my-1">
                    <img
                      src={icon}
                      alt={view.title}
                      className="pt-2"
                    />
                  </div>

                  <div className="column">
                    {view.title}
                  </div>

                  <div className="column is-narrow mx-2 pr-1">
                    <span className="icon is-small">
                      {currentKey === view.key ? <FaCheck /> : null}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThematicViewDropdownMenu;
