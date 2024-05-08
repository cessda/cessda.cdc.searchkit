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

import React, { Component, FocusEvent } from "react";
import { GroupedSelectedFilters, HitsStats, ResetFilters } from "searchkit";
import Language from "./Language";
import { connect, Dispatch } from "react-redux";
import { Link } from "react-router";
import counterpart from "counterpart";
import Reset from "./Reset";
import { queryBuilder } from "../utilities/searchkit";
import SearchBox from "./SearchBox";
import type { State } from "../types";
import { AnyAction, bindActionCreators } from "redux";
import {
  resetSearch,
  toggleAdvancedSearch,
  toggleMobileFilters,
  toggleSummary,
} from "../actions/search";
import Translate from "react-translate-component";
import Tooltip from "./Tooltip";

export type Props = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

export class Header extends Component<Props> {
  toggleSummaryRef: React.RefObject<HTMLAnchorElement>;

  constructor(props: Props) {
    super(props);
    this.toggleSummaryRef = React.createRef();
    this.focusToggleSummary = this.focusToggleSummary.bind(this);
  }

  focusToggleSummary() {
    if (this.toggleSummaryRef.current) {
      this.toggleSummaryRef.current.focus();
    }
  };

  handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      if (event.target instanceof HTMLElement) {
        event.target.click();
      }
    }
  };

  toggleClassOnFocusBlur(e: FocusEvent<HTMLElement>, className: string) {
    e.target.classList.toggle(className);
  }

  render() {
    const {
      pathname,
      resetSearch,
      filters,
      showFilterSummary,
      toggleSummary,
      showMobileFilters,
      toggleMobileFilters,
      showAdvancedSearch,
    } = this.props;

    return (
      <header>
        <div id="topstripe" className="is-hidden-mobile">
          <div className="container">
            <div className="columns is-gapless">
              <div className="column">
                <Translate
                  component="a"
                  className="cessda-organisation"
                  href="https://www.cessda.eu/"
                  content="cessda"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="columns is-centered is-gapless">
            <div className="column is-narrow">
              <div className="logo">
                <Link className="cessda-eric" to="/" aria-label={counterpart.translate("header.frontPage")} onClick={() => {
                    // Only reset search on the root path, otherwise two locations are added to the browser history
                    if (resetSearch && pathname === "/") {
                      resetSearch();
                    }
                  }}
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 654 153" aria-hidden="true">
                    <path
                      className="st0"
                      d="M287.9 105.3c0 2.8-.2 5.4-.7 7.9-.5 2.5-1.3 4.6-2.5 6.5s-2.9 3.3-5 4.4c-2.1 1.1-4.8 1.6-8.1 1.6H260c-.5 0-.8-.1-1-.2-.2-.2-.3-.4-.3-.8V86.2c0-.7.4-1 1.1-1h11.6c3.3 0 6 .5 8.1 1.6s3.8 2.5 5 4.3c1.2 1.8 2.1 3.9 2.6 6.4.5 2.3.8 5 .8 7.8zm-5.1.5c0-3.4-.3-6.2-1-8.3s-1.5-3.8-2.5-5c-1.1-1.2-2.3-2-3.6-2.4-1.4-.4-2.8-.6-4.3-.6h-8v31.8h7.5c1.4 0 2.8-.2 4.2-.5s2.7-1.1 3.8-2.1c1.1-1.1 2.1-2.6 2.8-4.7.7-2.1 1.1-4.8 1.1-8.2zm31.4 16.5c-1.5.9-3.2 1.8-5 2.6-1.9.8-4 1.2-6.4 1.2-3 0-5.1-.7-6.4-2.1-1.3-1.4-1.9-3.5-1.9-6.3 0-3.5.9-6 2.6-7.7s4.7-2.5 8.7-2.5h8.4v-2.1c0-2.2-.5-3.8-1.6-4.6s-2.9-1.3-5.6-1.3h-1.9c-.7 0-1.5.1-2.2.1l-2.3.2c-.8.1-1.5.1-2.1.2-.7.1-1.1-.1-1.2-.6l-.4-1.6c-.1-.3 0-.5.1-.7.1-.2.4-.4.9-.6.6-.2 1.3-.4 2.2-.6.9-.2 1.8-.3 2.7-.4.9-.1 1.9-.2 2.8-.2s1.7-.1 2.5-.1c2.5 0 4.4.3 5.9.8s2.6 1.3 3.3 2.2c.8.9 1.2 2.1 1.5 3.4s.3 2.8.3 4.5v13.5c0 .6 0 1.1.1 1.4s.2.6.3.7c.1.2.4.3.6.3.3.1.7.1 1.2.2.7 0 1 .3 1 .8v1.5c0 .3-.1.5-.2.7s-.5.3-1 .4c-.7.1-1.5.2-2.1.2-1.4 0-2.5-.3-3.2-.8-.7-.5-1.1-1.4-1.3-2.8l-.3.1zm.1-11h-9c-1.9 0-3.4.4-4.5 1.3s-1.6 2.5-1.6 4.9c0 1.7.3 2.9 1 3.5s1.9.9 3.7.9c.8 0 1.6-.1 2.5-.3.9-.2 1.8-.5 2.8-.8.9-.3 1.8-.7 2.7-1.1.9-.4 1.7-.8 2.4-1.2v-7.2zm28.8 12.4c0 .5-.1.9-.5 1.2-.4.2-.8.4-1.4.5-.6.2-1.2.3-1.9.4-.7.1-1.3.2-2 .2s-1.2.1-1.6.1c-1.3 0-2.4-.2-3.2-.5-.9-.3-1.5-.7-2-1.3-.5-.6-.8-1.2-1-2.1-.2-.8-.3-1.7-.3-2.7V99.7h-3.4c-.7 0-1-.3-1-1V97c0-.7.3-1.1 1-1.1h3.4v-6.6c0-.4.1-.6.3-.8.2-.2.4-.3.8-.4l2.4-.7c.7-.2 1 .1 1 .9v7.5h6.8c.5 0 .7.1.9.3s.2.4.2.8v1.8c0 .4-.1.6-.2.8s-.4.2-.9.2h-6.8v18.5c0 .7 0 1.3.1 1.8s.3.8.6 1.1.8.5 1.3.6 1.3.2 2.2.2c.3 0 .9 0 1.7-.1.8-.1 1.4-.1 1.9-.2.5 0 .8 0 1 .1.2.1.3.3.4.7l.2 1.3zm22.2-1.4c-1.5.9-3.2 1.8-5 2.6-1.9.8-4 1.2-6.4 1.2-3 0-5.1-.7-6.4-2.1-1.3-1.4-1.9-3.5-1.9-6.3 0-3.5.9-6 2.6-7.7s4.7-2.5 8.7-2.5h8.4v-2.1c0-2.2-.5-3.8-1.6-4.6s-2.9-1.3-5.6-1.3h-1.9c-.7 0-1.5.1-2.2.1l-2.3.2c-.8.1-1.5.1-2.1.2-.7.1-1.1-.1-1.2-.6l-.4-1.6c-.1-.3 0-.5.1-.7.1-.2.4-.4.9-.6.6-.2 1.3-.4 2.2-.6.9-.2 1.8-.3 2.7-.4.9-.1 1.9-.2 2.8-.2s1.7-.1 2.5-.1c2.5 0 4.4.3 5.9.8s2.6 1.3 3.3 2.2c.8.9 1.2 2.1 1.5 3.4s.3 2.8.3 4.5v13.5c0 .6 0 1.1.1 1.4s.2.6.3.7c.1.2.4.3.6.3.3.1.7.1 1.2.2.7 0 1 .3 1 .8v1.5c0 .3-.1.5-.2.7s-.5.3-1 .4c-.7.1-1.5.2-2.1.2-1.4 0-2.5-.3-3.2-.8-.7-.5-1.1-1.4-1.3-2.8l-.3.1zm.1-11h-9c-1.9 0-3.4.4-4.5 1.3s-1.6 2.5-1.6 4.9c0 1.7.3 2.9 1 3.5s1.9.9 3.7.9c.8 0 1.6-.1 2.5-.3.9-.2 1.8-.5 2.8-.8.9-.3 1.8-.7 2.7-1.1.9-.4 1.7-.8 2.4-1.2v-7.2zm45-26.6c.6 0 1.4 0 2.3.1 2 .1 4 .3 5.9.7 1 .2 1.9.5 2.8.8.4.2.7.4.8.6.1.2.1.4 0 .7l-.4 1.7-.3.6c-.1.2-.4.2-.8.1-1.3-.2-2.9-.4-4.7-.6-1.8-.2-3.6-.3-5.5-.3-2.4 0-4.2.4-5.6 1.3-1.4.9-2.4 2.1-3.2 3.6s-1.2 3.3-1.4 5.3c-.2 2-.3 4.2-.3 6.4 0 2 .1 4 .4 5.9.2 1.9.7 3.6 1.5 5.1.7 1.4 1.8 2.7 3.2 3.5 1.4.9 3.2 1.3 5.4 1.3 1.9 0 3.7-.1 5.4-.3 1.7-.2 3.3-.4 4.8-.6.5-.1.7 0 .9.2l.3.6.3 1.6c.1.3.1.6 0 .8-.1.2-.3.4-.7.6-.7.3-1.6.6-2.6.8-1 .2-2 .4-3.1.5l-3 .3c-.9.1-1.7.1-2.3.1-3.2 0-5.8-.6-7.9-1.7s-3.6-2.6-4.8-4.5c-1.1-1.9-1.9-4-2.4-6.5-.4-2.4-.6-5-.6-7.6 0-2.7.2-5.3.6-7.8.4-2.5 1.1-4.8 2.3-6.8 1.1-1.9 2.7-3.5 4.7-4.7 2-1.2 4.7-1.8 8-1.8zm35.7 37.6c-1.5.9-3.2 1.8-5 2.6-1.9.8-4 1.2-6.5 1.2-3 0-5.1-.7-6.4-2.1-1.3-1.4-1.9-3.5-1.9-6.3 0-3.5.9-6 2.6-7.7s4.7-2.5 8.7-2.5h8.4v-2.1c0-2.2-.5-3.8-1.6-4.6s-2.9-1.3-5.6-1.3h-1.9c-.7 0-1.5.1-2.2.1l-2.3.2c-.8.1-1.5.1-2.1.2-.7.1-1.1-.1-1.2-.6l-.4-1.6c-.1-.3 0-.5.1-.7.1-.2.4-.4.9-.6.6-.2 1.3-.4 2.2-.6.9-.2 1.8-.3 2.7-.4s1.9-.2 2.8-.2c.8 0 1.7-.1 2.5-.1 2.4 0 4.4.3 5.8.8 1.5.5 2.6 1.3 3.3 2.2.8.9 1.2 2.1 1.5 3.4.2 1.3.3 2.8.3 4.5v13.5c0 .6 0 1.1.1 1.4s.2.6.3.7c.1.2.4.3.6.3.3.1.7.1 1.2.2.7 0 1 .3 1 .8v1.5c0 .3-.1.5-.2.7s-.5.3-1 .4c-.7.1-1.5.2-2.1.2-1.4 0-2.5-.3-3.2-.8-.7-.5-1.1-1.4-1.3-2.8l-.1.1zm0-11h-9c-1.9 0-3.4.4-4.5 1.3s-1.6 2.5-1.6 4.9c0 1.7.3 2.9 1 3.5s1.9.9 3.7.9c.8 0 1.6-.1 2.5-.3.9-.2 1.8-.5 2.8-.8.9-.3 1.8-.7 2.7-1.1.9-.4 1.7-.8 2.4-1.2v-7.2zm28.9 12.4c0 .5-.1.9-.5 1.2-.4.2-.9.4-1.4.5-.6.2-1.2.3-1.9.4-.7.1-1.3.2-2 .2-.6.1-1.2.1-1.6.1-1.3 0-2.4-.2-3.2-.5-.9-.3-1.5-.7-2-1.3-.5-.6-.8-1.2-1-2.1-.2-.8-.3-1.7-.3-2.7V99.7h-3.4c-.7 0-1-.3-1-1V97c0-.7.4-1.1 1-1.1h3.4v-6.6c0-.4.1-.6.3-.8.2-.2.4-.3.8-.4l2.5-.7c.7-.2 1 .1 1 .9v7.5h6.8c.5 0 .7.1.9.3s.2.4.2.8v1.8c0 .4-.1.6-.2.8s-.4.2-.9.2h-6.8v18.5c0 .7 0 1.3.1 1.8s.3.8.6 1.1.8.5 1.3.6c.5.1 1.3.2 2.2.2.3 0 .9 0 1.7-.1s1.4-.1 1.9-.2c.5 0 .8 0 1 .1.2.1.3.3.4.7l.1 1.3zm22.2-1.4c-1.5.9-3.2 1.8-5 2.6-1.9.8-4 1.2-6.5 1.2-3 0-5.1-.7-6.4-2.1-1.3-1.4-1.9-3.5-1.9-6.3 0-3.5.9-6 2.6-7.7s4.7-2.5 8.7-2.5h8.4v-2.1c0-2.2-.5-3.8-1.6-4.6s-2.9-1.3-5.6-1.3H488c-.7 0-1.5.1-2.2.1l-2.3.2c-.8.1-1.5.1-2.1.2-.7.1-1.1-.1-1.2-.6l-.4-1.6c-.1-.3 0-.5.1-.7.1-.2.4-.4.9-.6.6-.2 1.3-.4 2.2-.6s1.8-.3 2.7-.4 1.9-.2 2.8-.2c.8 0 1.7-.1 2.5-.1 2.4 0 4.4.3 5.8.8 1.5.5 2.6 1.3 3.3 2.2.8.9 1.2 2.1 1.5 3.4.2 1.3.3 2.8.3 4.5v13.5c0 .6 0 1.1.1 1.4s.2.6.3.7c.1.2.4.3.6.3.3.1.7.1 1.2.2.7 0 1 .3 1 .8v1.5c0 .3-.1.5-.2.7s-.5.3-1 .4c-.7.1-1.4.2-2.1.2-1.5 0-2.5-.3-3.2-.8-.7-.5-1.1-1.4-1.3-2.8l-.1.1zm.1-11h-9c-1.9 0-3.4.4-4.5 1.3s-1.6 2.5-1.6 4.9c0 1.7.3 2.9 1 3.5s1.9.9 3.7.9c.8 0 1.6-.1 2.5-.3.9-.2 1.8-.5 2.8-.8.9-.3 1.8-.7 2.7-1.1.9-.4 1.7-.8 2.4-1.2v-7.2zm22.2 12.9c0 .5-.2.8-.6 1-.5.2-1 .4-1.6.5-.6.1-1.2.2-1.7.2-1 0-1.8-.1-2.5-.4-.7-.2-1.2-.6-1.5-1-.4-.4-.6-1-.8-1.6-.1-.6-.2-1.3-.2-2.1V83.7c0-.7.3-1 1-1h2.4c.4 0 .6.1.8.2s.3.4.3.9v35.7c0 1.1.2 1.7.7 1.9.4.2 1.2.3 2.4.3.7 0 1 .2 1 .6l.3 1.9zm29-14c0 1.8-.1 3.6-.3 5.5-.2 1.9-.7 3.6-1.5 5.1-.8 1.6-2.1 2.8-3.8 3.8s-4.1 1.5-7.1 1.5c-2.9 0-5.2-.5-6.9-1.5-1.7-1-2.9-2.2-3.7-3.8s-1.3-3.2-1.5-5.1-.3-3.7-.3-5.5c0-1.5.1-3.1.4-4.8s.8-3.4 1.6-4.9c.8-1.5 2.1-2.8 3.7-3.8s3.8-1.5 6.6-1.5 5 .4 6.7 1.3c1.7.9 3 2 3.9 3.4.9 1.4 1.5 3 1.7 4.8.4 1.9.5 3.7.5 5.5zm-4.7.4c0-1.9-.1-3.5-.3-4.9s-.6-2.6-1.2-3.5-1.4-1.6-2.5-2.1c-1-.5-2.4-.7-4.1-.7-1.6 0-2.9.2-3.8.7s-1.8 1.2-2.3 2.1-1 2.1-1.2 3.5c-.2 1.4-.3 3-.3 4.9 0 1.9.1 3.5.3 4.9.2 1.4.6 2.5 1.2 3.5.6.9 1.3 1.6 2.3 2.1 1 .5 2.3.7 3.8.7 1.7 0 3-.2 4.1-.7 1-.4 1.9-1.1 2.5-2 .6-.9 1-2.1 1.2-3.5.2-1.4.3-3.1.3-5zm23.1-15.3c.9 0 1.9 0 2.9.1l3 .3c1 .1 1.9.3 2.8.5.9.2 1.7.4 2.4.6.7.2 1.1.6 1.3 1 .2.5.2 1 .2 1.4v26.6c0 1.6-.1 3.1-.4 4.5s-.8 2.5-1.6 3.5-2 1.8-3.5 2.3c-1.5.6-3.6.8-6.2.8-.8 0-1.6 0-2.5-.1-.9 0-1.8-.1-2.7-.2-.9-.1-1.7-.2-2.6-.4-.8-.2-1.6-.4-2.2-.7-.4-.2-.6-.4-.7-.6s0-.5 0-.7l.2-1.3c.1-.4.2-.6.5-.7.2-.1.6-.1 1 0 1.3.2 2.8.4 4.3.4 1.6.1 3 .1 4.3.1 1.4 0 2.6-.1 3.5-.3s1.7-.6 2.2-1.1.9-1.1 1.2-1.9c.2-.8.3-1.7.3-2.7v-2.4c-1.9.7-3.5 1.2-4.9 1.4-1.4.3-2.7.4-3.8.4-2.4 0-4.3-.4-5.8-1.1s-2.7-1.7-3.6-3.1c-.9-1.3-1.5-2.9-1.9-4.8-.3-1.9-.5-4-.5-6.3 0-2.5.2-4.7.6-6.6.4-1.9 1.1-3.6 2.1-4.9 1-1.3 2.3-2.4 3.9-3.1 1.8-.6 3.8-.9 6.2-.9zm-7.7 15.1c0 2.2.1 4 .4 5.4s.6 2.7 1.2 3.6c.5.9 1.2 1.6 2.1 2 .8.4 1.9.6 3.2.6 1.1 0 2.5-.1 4.1-.4 1.6-.2 3.2-.6 4.7-1v-20.3c-1.2-.2-2.5-.3-3.8-.5-1.4-.1-2.7-.2-4-.2-1.1 0-2.1.1-3.1.4-1 .2-1.8.7-2.5 1.5s-1.3 1.8-1.7 3.2c-.4 1.4-.6 3.3-.6 5.7zm50.3 15.2H607c-.7 0-1.1-.3-1.1-1v-2.1l-.1-.1c-.5.3-1.1.7-1.9 1.2-.8.4-1.7.9-2.6 1.3-.9.4-1.9.8-3 1-1.1.3-2.1.4-3.2.4-2 0-3.6-.3-4.8-.9-1.2-.6-2.1-1.3-2.7-2.3-.6-1-1-2.2-1.2-3.6s-.3-2.9-.3-4.5V97c0-.7.3-1 1-1h2.7c.7 0 1 .3 1 1v18c0 1.4.1 2.6.2 3.5.2.9.4 1.6.8 2.1s.9.9 1.5 1.1c.7.2 1.4.3 2.4.3.7 0 1.6-.1 2.5-.4 1-.3 2-.6 2.9-1 1-.4 1.9-.8 2.7-1.2s1.5-.7 2-1V96.9c0-.7.3-1 1-1h2.5c.7 0 1 .3 1 1v27.7c.2.7-.1 1-.8 1zm32-16.8c0 1-.1 1.8-.5 2.5-.3.7-1.1 1-2.2 1h-17.2c0 1.8.2 3.3.5 4.6.3 1.2.8 2.2 1.4 3 .7.8 1.5 1.3 2.5 1.6 1 .3 2.2.5 3.6.5.6 0 1.3 0 2.1-.1l2.3-.2c.8-.1 1.5-.1 2.2-.2s1.3-.2 1.9-.2c.4 0 .7 0 1 .1.2.1.4.3.5.7l.2 1.4c.1.6-.1 1-.7 1.2s-1.3.5-2.1.7c-.8.2-1.7.4-2.6.5-.9.1-1.8.3-2.7.3-.9.1-1.7.1-2.4.1-2.8 0-5-.4-6.7-1.3-1.7-.9-2.9-2-3.8-3.4-.8-1.4-1.4-3.1-1.7-4.9-.3-1.8-.4-3.8-.4-5.7 0-1.5.1-3.1.4-4.9.2-1.8.8-3.5 1.7-5.1.8-1.6 2.1-2.9 3.7-3.9 1.6-1.1 3.8-1.6 6.7-1.6 2.6 0 4.7.4 6.3 1.2 1.6.8 2.8 1.8 3.7 3.1s1.5 2.7 1.8 4.3c.2 1.4.4 3 .5 4.7zm-5-.4c0-1.1-.1-2.1-.3-3.2s-.5-2.1-1.1-2.9-1.3-1.6-2.3-2.1c-1-.5-2.3-.8-3.9-.8-1.3 0-2.5.2-3.4.6-.9.4-1.7 1-2.2 1.8-.6.8-1 1.7-1.3 2.8s-.5 2.3-.5 3.7h15zM166.1 128.1c-.6 0-1-.1-1.2-.4-.2-.3-.3-.6-.3-1.1V85.1c0-.4.1-.8.3-1.1s.6-.4 1.2-.4h14.6c3.9 0 7.1.6 9.6 1.8 2.5 1.2 4.6 2.8 6 4.8 1.5 2 2.5 4.3 3.1 7s.9 5.5.9 8.4c0 3-.3 5.8-.9 8.5s-1.6 5.1-3.1 7.1c-1.5 2.1-3.5 3.7-6 4.9-2.5 1.2-5.8 1.8-9.7 1.8l-14.5.2zm23.1-21.9c0-4.7-.8-8.2-2.3-10.4-1.5-2.2-3.9-3.3-7.1-3.3H175v26.6h4.3c1.5 0 2.9-.2 4.1-.7 1.2-.5 2.3-1.2 3.1-2.2.8-1 1.5-2.4 2-4s.7-3.6.7-6zm18.7-.1c0-2.7.3-5.4.8-8.2.5-2.7 1.5-5.2 2.9-7.4s3.4-3.9 5.9-5.3c2.5-1.4 5.8-2 9.9-2 2.1 0 4.3.2 6.5.5s4.3.9 6.1 1.6c.7.3 1.2.7 1.5 1 .4.4.4 1 .3 1.8l-.9 3.9c-.1.6-.4 1-.6 1.2-.3.2-.8.2-1.6.1-1.9-.2-3.7-.4-5.4-.5s-3.4-.2-4.8-.2c-1.9 0-3.4.3-4.6 1-1.2.7-2.1 1.7-2.8 2.8-.7 1.2-1.1 2.6-1.4 4.2-.2 1.6-.4 3.3-.4 5.2 0 2.1.1 4 .4 5.7.2 1.7.7 3.1 1.4 4.2.6 1.1 1.6 2.1 2.8 2.6 1.2.6 2.7.9 4.5.9 1.8 0 3.5-.1 5-.2s3.3-.3 5.4-.5c.9-.1 1.4-.1 1.7.1s.5.6.7 1.2l.9 3.5c.2.8.2 1.5-.2 1.9-.3.4-.8.8-1.5 1.1-.9.4-1.8.7-2.8 1-1.1.3-2.1.5-3.3.7-1.1.2-2.3.3-3.4.4s-2.2.1-3.2.1c-4 0-7.3-.7-9.8-2s-4.5-3-5.9-5.2c-1.4-2.1-2.4-4.6-2.9-7.3-.9-2.4-1.1-5.2-1.2-7.9z"
                    />
                    <path
                      d="M187.2 71.3H177c-5.8 0-10.5-4.7-10.5-10.5V43.7c0-5.8 4.7-10.5 10.5-10.5h10.2c1.1 0 1.9.9 2 2 0 1.1-.9 2-1.9 2h-10.2c-3.6 0-6.6 3-6.6 6.6v17.1c0 3.6 3 6.6 6.6 6.6h10.2c1.1 0 2 .9 2 2s-1 1.8-2.1 1.8m28.9 0H204c-5.8 0-10.5-4.7-10.5-10.5V43.7c0-5.8 4.7-10.5 10.5-10.5h4.9c5.8 0 10.5 4.7 10.5 10.5v9.5H201c-1.1 0-2-.9-2-2s.9-2 2-2h14.4v-5.6c0-3.6-3-6.6-6.6-6.6h-4.9c-3.6 0-6.6 3-6.6 6.6v17.1c0 3.6 3 6.6 6.6 6.6H216c1.1 0 2 .9 2 2s-.9 2-1.9 2m114.8-.2h-6c-2.9 0-5.6-1.4-7.6-4-1.9-2.4-2.9-5.7-2.9-9.1 0-6.9 4.3-11.8 10.5-11.8h8.6c1.1 0 2 .9 2 2s-.9 2-2 2h-8.6c-4 0-6.6 3.2-6.6 7.9 0 5.1 3 9.2 6.6 9.2h6c3.6 0 6.6-3 6.6-6.6V43.5c0-3.6-3-6.6-6.6-6.6h-11.3c-1.1 0-2-.9-2-2s.9-2 2-2h11.3c5.8 0 10.5 4.7 10.5 10.5v17.1c0 5.9-4.7 10.6-10.5 10.6m-32.5.2h-6.2c-5.8 0-10.5-4.7-10.5-10.5V43.7c0-5.8 4.7-10.5 10.5-10.5h8.8c1.1 0 2 .9 2 2s-.9 2-2 2h-8.8c-3.6 0-6.6 3-6.6 6.6v17.1c0 3.6 3 6.6 6.6 6.6h6.2c3.6 0 6.6-3 6.6-6.6V18c0-1.1.9-2 2-2s2 .9 2 2v42.8c0 5.8-4.8 10.5-10.6 10.5m-59.8 0h-11.2c-1.1 0-2-.9-2-2s.9-2 2-2h11.2c3.5 0 6.4-2.8 6.4-6.3 0-3-2.1-5.6-5.1-6.2l-5.5-1.1c-.9-.2-2.1-.5-2.5-.7-3.9-1.5-6.6-5.4-6.6-9.6 0-5.7 4.6-10.3 10.3-10.3h8.5c1.1 0 2 .9 2 2s-.9 2-2 2h-8.5c-3.5 0-6.4 2.8-6.4 6.3 0 2.6 1.6 5 4.1 5.9.2.1 1.2.4 1.8.5h.1l5.5 1.1c4.8 1 8.2 5.2 8.2 10-.1 5.8-4.7 10.4-10.3 10.4m27.3 0h-11.2c-1.1 0-2-.9-2-2s.9-2 2-2h11.2c3.5 0 6.4-2.8 6.4-6.3 0-3-2.1-5.6-5.1-6.2l-5.5-1.1c-.9-.2-2.1-.5-2.5-.7-3.9-1.5-6.6-5.4-6.6-9.6 0-5.7 4.6-10.3 10.3-10.3h8.5c1.1 0 2 .9 2 2s-.9 2-2 2h-8.5c-3.5 0-6.4 2.8-6.4 6.3 0 2.6 1.6 5 4.1 5.9.2.1 1.2.4 1.8.5h.1L268 51c4.8 1 8.2 5.2 8.2 10 0 5.7-4.6 10.3-10.3 10.3"
                      fill="#626873"
                    />
                    <path
                      d="M138.1 53.5l-19.6-19.6c-.1-.1-.2-.2-.4-.3l-15.3-15.2C89.4 5 67.6 5 54.3 18.4L37.4 35.2 21.6 51c-4 4-7 9-8.6 14.5-3.4 11.7-.6 24.8 8.6 34l19.6 19.6c.1.1.2.2.4.3l15.3 15.2c13.4 13.4 35.2 13.4 48.5 0l32.7-32.7c13.4-13.3 13.3-35.1 0-48.4z"
                      fill="#a0cae7"
                    />
                    <path
                      className="st3"
                      d="M94.6 123.7L127.3 91c12.9-12.9 13.3-33.6 1.3-47l-10.1-10.1c-.1-.1-.2-.2-.4-.3l-15.3-15.2C89.4 5 67.6 5 54.3 18.4L37.4 35.2 21.6 51c-4 4-7 9-8.6 14.5-3.3 10.9-1 23.1 6.8 32.1l10.5 10.5c.1.1.2.2.4.3L46 123.6c13.4 13.5 35.2 13.5 48.6.1z"
                    />
                    <path
                      className="st3"
                      d="M105.4 134.7l23.2-23.2c12-13.4 11.6-34.2-1.3-47.1l-19.6-19.6c-.1-.1-.2-.2-.4-.3L92 29.3c-13.4-13.4-35.2-13.4-48.5 0L26.6 46.2l-6.7 6.7c-3.2 3.7-5.5 8-6.9 12.6-3.4 11.7-.6 24.8 8.6 34l19.6 19.6c.1.1.2.2.4.3l15.3 15.2c13.3 13.5 35.1 13.5 48.5.1z"
                    />
                    <path
                      d="M81.2 124.1c-3.7 0-7.2-1.4-9.8-4.1l-19.7-19.6L36.2 85c-1.9-1.9-3.3-4.4-3.8-7.1-.9-4.5.5-9.1 3.7-12.3l32.7-32.7c2.6-2.6 6-4 9.7-4 3.7 0 7.2 1.4 9.8 4.1l19.6 19.5.2.2v.1L123.5 68c5.4 5.4 5.4 14.1 0 19.4l-32.7 32.7c-2.5 2.6-6 4-9.6 4z"
                      fill="#74c0eb"
                    />
                    <path
                      className="st5"
                      d="M78.5 30.7c3.1 0 6.2 1.2 8.5 3.5l19.7 19.5 15.6 15.6c4.7 4.7 4.7 12.2 0 16.9l-32.7 32.7c-2.2 2.2-5.2 3.5-8.4 3.5-3.1 0-6.2-1.2-8.5-3.5L53 99.3 37.4 83.7c-1.7-1.7-2.8-3.8-3.3-6.2-.7-3.8.3-7.8 3.2-10.7L53.1 51 70 34.1c2.4-2.3 5.4-3.4 8.5-3.4m0-3.6c-4.1 0-8 1.6-10.9 4.5L50.7 48.5 34.9 64.3c-3.6 3.6-5.2 8.9-4.2 13.9.6 3 2.1 5.8 4.3 8l15.4 15.4.1.1.2.2 19.6 19.4c2.9 2.9 6.8 4.6 11 4.6 4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-11 0-4.1-1.6-8-4.6-11l-15.5-15.5-.1-.1h-.1L89.5 31.7c-2.9-3-6.9-4.6-11-4.6z"
                    />
                    <path
                      className="st5"
                      d="M98.3 60v-.2c0-4.8-9.3-7.3-18.5-7.3S61.4 55 61.4 59.8v31.4c0 4.8 9.3 7.3 18.5 7.3s18.5-2.5 18.5-7.3V60zm-18.5-4.8c9.6 0 15.8 2.8 15.8 4.7v.1c-.3 1.9-6.3 4.5-15.8 4.5-9.6 0-15.8-2.8-15.8-4.7 0-1.9 6.2-4.6 15.8-4.6zm0 40.7c-9.6 0-15.8-2.8-15.8-4.7V87c3.4 2 9.9 3 16.1 3 .7 0 1.3-.6 1.3-1.3 0-.7-.6-1.3-1.3-1.3-10.3 0-15.8-2.6-15.8-3.6 0-.3-.1-.6-.3-.8v-3.1c3.4 2 9.9 3 16.1 3 .7 0 1.3-.6 1.3-1.3 0-.7-.6-1.3-1.3-1.3-10.3 0-15.8-2.6-15.8-3.6 0-.3-.1-.6-.3-.8V72c3.4 2 9.9 3 16.1 3 .7 0 1.3-.6 1.3-1.3 0-.7-.6-1.3-1.3-1.3-10.3 0-15.8-2.6-15.8-3.6 0-.3-.1-.6-.3-.8v-3.9c3.4 2.2 9.6 3.3 15.8 3.3 6.2 0 12.3-1.1 15.8-3.3V91.5c0 1.7-6.1 4.4-15.8 4.4z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="column is-narrow skip-link-wrapper is-hidden-mobile">
              <a href="#main" id="skip-to-main" className="link is-sr-only"
                onFocus={(e: FocusEvent<HTMLElement>) => this.toggleClassOnFocusBlur(e, "is-sr-only")}
                onBlur={(e: FocusEvent<HTMLElement>) => this.toggleClassOnFocusBlur(e, "is-sr-only")}>
                <Translate content="header.skipToMain"/>
              </a>
            </div>
            <div className="column">
              <div className="search-wrapper" role="search">
                <SearchBox
                  autofocus={true}
                  searchOnChange={true}
                  queryBuilder={queryBuilder}
                />
                <Language />
              </div>
            </div>
            <div className="column is-narrow button-wrapper">
              <Tooltip id="search-tooltip"
                       content={counterpart.translate("search.tooltip.content")}
                       ariaLabel={counterpart.translate("search.tooltip.ariaLabel")}/>
            </div>
          </div>
        </div>
        <div id="bluestripe">
          <div className="container">
            <div className="columns is-mobile is-gapless is-vcentered">
              <div className="column is-narrow-touch">
                <div className="reset-search">
                  {pathname === '/' &&
                    <a id="toggle-mobile-filters" className="sk-reset-filters link mobile-filters-toggle" tabIndex={0}
                      onClick={toggleMobileFilters} onKeyDown={(e: React.KeyboardEvent) => this.handleKeyDown(e)}>
                      {showMobileFilters ? <Translate content="hideFilters"/> : <Translate content="showFilters"/>}
                    </a>
                  }

                  {filters &&
                    <a id="toggle-summary" className="sk-reset-filters link is-hidden-mobile" tabIndex={0}
                      onClick={toggleSummary} onKeyDown={(e: React.KeyboardEvent) => this.handleKeyDown(e)}
                      ref={this.toggleSummaryRef}>
                      {counterpart.translate('filters.summary.label')}
                    </a>
                  }
                  <span id="reset-filters" onKeyDown={(e: React.KeyboardEvent) => this.handleKeyDown(e)}>
                    <ResetFilters component={Reset}
                                  options={{query: false, filter: true, pagination: true}}
                                  translations={{
                                    'reset.clear_all': counterpart.translate('reset.filters')
                                  }}/>
                  </span>
                  <span id="clear-search" onKeyDown={(e: React.KeyboardEvent) => this.handleKeyDown(e)}>
                    <ResetFilters component={Reset}
                                  options={{query: true, filter: false, pagination: true}}
                                  translations={{
                                    'reset.clear_all': counterpart.translate('reset.query')
                                  }}/>
                  </span>
                </div>
              </div>
              <div className="column is-centered is-hidden-touch">
                {pathname === "/" && <HitsStats className="hits-count" />}
              </div>
              <nav className="column has-text-right-tablet has-text-left-mobile is-narrow-touch" aria-label="Main">
                <Translate component={Link} to="/" className="sk-reset-filters link is-hidden-mobile is-sr-only" content="header.frontPage"
                          onFocus={(e: FocusEvent<HTMLElement>) => this.toggleClassOnFocusBlur(e, "is-sr-only")}
                          onBlur={(e: FocusEvent<HTMLElement>) => this.toggleClassOnFocusBlur(e, "is-sr-only")}/>
                <Translate component={Link} to="/about" className="sk-reset-filters link is-hidden-mobile" content="about.label"/>
                <Translate component="a" href="/documentation" className="sk-reset-filters link is-hidden-mobile" content="documentation.label"/>
                <Translate component="a" href="https://api.tech.cessda.eu/" className="sk-reset-filters link is-hidden-mobile" content="api.label"/>
              </nav>
            </div>
          </div>
        </div>

         {showFilterSummary &&
          <div className="modal is-active">
            <div className="modal-background"/>
            <div className="modal-card">
              <div className="modal-card-head">
                <Translate component="h2" className="modal-card-title" content="filters.summary.label"/>
                <button id="close-filter-summary-top" className="delete" aria-label="close"
                        onClick={() => {toggleSummary(); this.focusToggleSummary();}} autoFocus/>
              </div>
              <section className="modal-card-body">
                {filters ?
                  <>
                    <Translate component="p" className="pb-10" content="filters.summary.introduction" />
                    <GroupedSelectedFilters />
                    <Translate component="p" content="filters.summary.remove" />
                  </>
                :
                  <>
                    <Translate component="p" className="pb-10" content="filters.summary.noFilters" />
                    <Translate component="p" content="filters.summary.close" unsafe />
                  </>
                }
              </section>
              <div className="modal-card-foot">
                <button id="close-filter-summary-bottom" className="button is-light focus-visible"
                        onClick={() => {toggleSummary(); this.focusToggleSummary();}}>
                  <Translate content="close" />
                </button>
              </div>
            </div>
          </div>
        }

      {showAdvancedSearch &&
          <div className="modal is-active">
            <div className="modal-background" />
            <div className="modal-card">
              <div className="modal-card-head">
                <Translate component="p" className="modal-card-title" content="advancedSearch.label" />
                <button className="delete" aria-label="close" onClick={this.props.toggleAdvancedSearch} />
              </div>
              <section className="modal-card-body">
                <Translate component="p" className="pb-10" content="advancedSearch.introduction" />
                {this.generateTranslatedParagraph("advancedSearch.and")}
                {this.generateTranslatedParagraph("advancedSearch.or")}
                {this.generateTranslatedParagraph("advancedSearch.negates")}
                {this.generateTranslatedParagraph("advancedSearch.phrase")}
                {this.generateTranslatedParagraph("advancedSearch.prefix")}
                {this.generateTranslatedParagraph("advancedSearch.precedence")}
                {this.generateTranslatedParagraph("advancedSearch.distance")}
                {this.generateTranslatedParagraph("advancedSearch.slop")}
                <p className="pt-15">
                  <Translate component="strong" content="advancedSearch.escaping.heading" unsafe />
                </p>
                {this.generateTranslatedParagraph("advancedSearch.escaping.content")}
                <p className="pt-15">
                  <Translate component="strong" content="advancedSearch.defaultOperator.heading" unsafe />
                </p>
                <Translate component="p" content="advancedSearch.defaultOperator.content"
                              with={{className: 'has-text-weight-semibold'}}
                              unsafe/>
              </section>
              <div className="modal-card-foot">
                <Translate component="button" className="button is-light"
                              onClick={toggleAdvancedSearch}
                              content="close"/>
              </div>
            </div>
          </div>
        }
        <div className="is-hidden-desktop mt-2 has-text-centered">
          {pathname === "/" && <HitsStats className="hits-count" />}
        </div>
      </header>
    );
  }

/**
   * Returns a translatable \<p\> element with substitution enabled.
   * @param {String} translationString the string to translate
   */
  generateTranslatedParagraph(translationString: string) {
    return <Translate component="p" content={translationString}
      with={{ className: 'tag is-light has-text-weight-semibold' }}
      unsafe />;
  }
}

export function mapStateToProps(state: State) {
  return {
    pathname: state.routing.locationBeforeTransitions.pathname,
    currentLanguage: state.language.currentLanguage,
    filters: state.search.query.post_filter,
    showFilterSummary: state.search.showFilterSummary,
    showMobileFilters: state.search.showMobileFilters,
    showAdvancedSearch: state.search.showAdvancedSearch,
    // Needed to refresh the total amount of studies
    totalStudies: state.search.totalStudies
  };
}

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    resetSearch: bindActionCreators(resetSearch, dispatch),
    toggleSummary: bindActionCreators(toggleSummary, dispatch),
    toggleMobileFilters: bindActionCreators(toggleMobileFilters, dispatch),
    toggleAdvancedSearch: bindActionCreators(toggleAdvancedSearch, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
