import React, { useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router';

export interface IndexDropdownMenuProps {
    currentKey: string;
    items: ThematicViewMenuItem[];
}

export interface ThematicViewMenuItem {
  title: string;
  key: string;
  url: string;
  icon?: string;
  action?: () => void;
}

const ThematicViewDropdownMenu = ({
    currentKey,
    items,
}: IndexDropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(
        null
    );
    const navigate = useNavigate();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setOpen((prev) => {
            if (!prev) setFocusedIndex(null);
            return !prev;
        });
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLButtonElement>
    ) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setFocusedIndex(0); // Focus on the first item when arrow is pressed
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        } else if (event.key === 'Escape') {
            setOpen(false);
            setFocusedIndex(null); // Reset focus when dropdown closes
        }
    };

    const handleItemKeyDown = (
        event: React.KeyboardEvent<HTMLLIElement>,
        index: number
    ) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setFocusedIndex((prevIndex) =>
                prevIndex! < items.length - 1 ? prevIndex! + 1 : 0
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setFocusedIndex((prevIndex) =>
                prevIndex! > 0 ? prevIndex! - 1 : items.length - 1
            );
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const selectedItem = items[index];
            if (selectedItem.url) {
                navigate(selectedItem.url);
            } else if (selectedItem.action) {
                selectedItem.action();
            }
            setOpen(false);
            setFocusedIndex(null);
            buttonRef.current?.focus();
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
        if (open && focusedIndex !== -1) {
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
                        className=""
                    >
                        {items.map((item, index) => (
                            <li
                                role="menuitem"
                                id={`dropdown-item-${index}`}
                                key={item.key}
                                className={`${focusedIndex === index ? 'columns is-mobile is-gapless mb-0 has-background-grey-lighter' : 'columns is-mobile is-gapless mb-0'
                                    }`}
                                tabIndex={focusedIndex === index ? 0 : -1}
                                onKeyDown={(event) => handleItemKeyDown(event, index)}
                            >
                                <a href={item.url} onClick={() => setOpen(false)} className={`${currentKey === item.key ? 'column columns is-mobile is-gapless is-vcentered tv-menu-item selected py-1' : 'column columns is-mobile is-gapless is-vcentered tv-menu-item py-1'
                                    }`}>
                                    <div className="select-icon column is-narrow mx-3 my-1">


                                        <img src={item.icon} alt={item.title} className="pt-2"></img>

                                    </div>

                                    <div className="column">
                                        {item.title}
                                        
                                    </div>
                                    <div className="column is-narrow mx-2 pr-1">
                                    <span className="icon is-small">                               
                                    
                                    {currentKey === item.key ? <FaCheck /> : ''}
                                    </span>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ThematicViewDropdownMenu;
