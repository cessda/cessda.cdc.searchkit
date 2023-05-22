
// Copyright CESSDA ERIC 2017-2023
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
import Select, { HandlerRendererResult, OptionValues, Option, Options } from 'react-select';
import {AbstractItemList, ItemListProps} from 'searchkit';

export interface Props extends ItemListProps {
  placeholder: string | JSX.Element | undefined;
  clearable?: boolean;
  ariaLabel?: string;
}

export default class MultiSelect extends AbstractItemList {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(selectedOptions: Option<OptionValues> | Options<OptionValues> | null) {
    if (Array.isArray(selectedOptions)) {
      const items: string[] = [];
      selectedOptions.forEach(el => {
        if (el.value) {
          items.push(el.value.toString());
        } else {
          items.push('');
        }
      });
      this.props.setItems(items);
    } else if (selectedOptions?.value) {
      this.props.setItems([selectedOptions.value.toString()])
    }
  }

  renderValue(value: Option<OptionValues>): HandlerRendererResult {
    if (value.label) {
      return <span>{value.label.replace('undefined', '0')}</span>;
    } else {
      return null;
    }
  }

  render() {
    const {
      placeholder,
      clearable = true,
      items,
      selectedItems = [],
      disabled,
      showCount,
      ariaLabel
    } = this.props;

    const options: Options<OptionValues> = items.map((option): Option<OptionValues> => {
      let label = option.title || option.label || option.key;
      if (showCount) {
        label += ` (${option.doc_count})`;
      }
      return {value: option.key, label};
    });

    return (
      <Select multi
              disabled={disabled}
              value={selectedItems}
              placeholder={placeholder}
              options={options}
              valueRenderer={this.renderValue}
              clearable={clearable}
              onChange={this.handleChange}
              aria-label={ariaLabel}/>
    );
  }
}
