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

import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useMatomoTracking, useSearchTracking } from "../../src/hooks";
import { useInstantSearch } from "react-instantsearch";
import getPaq from "../../src/utilities/getPaq";

// Mock getPaq
jest.mock("../../src/utilities/getPaq", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockPaq: any[][] = [];
  return () => mockPaq;
});

// Mock useInstantSearch
jest.mock("react-instantsearch", () => {
  const actual = jest.requireActual("react-instantsearch");
  return {
    ...actual,
    useInstantSearch: jest.fn(),
  };
});

describe("useMatomoTracking", () => {
  const TestComponent = () => {
    useMatomoTracking();
    return <div>Test</div>;
  };

  it("pushes page view events to Matomo", () => {
    const _paq = getPaq();
    _paq.length = 0;

    render(
      <MemoryRouter initialEntries={["/test?query=1"]}>
        <TestComponent />
      </MemoryRouter>
    );

    expect(_paq.some(call => call[0] === "trackPageView")).toBe(true);
    expect(_paq.some(call => call[0] === "setCustomUrl" && call[1] === "/test?query=1")).toBe(true);
  });

  it("scans for media and forms if #root exists", () => {
    const _paq = getPaq();
    _paq.length = 0;

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    render(
      <MemoryRouter initialEntries={["/test"]}>
        <TestComponent />
      </MemoryRouter>
    );

    expect(_paq.some(call => call[0] === "MediaAnalytics::scanForMedia")).toBe(true);
    expect(_paq.some(call => call[0] === "FormAnalytics::scanForForms")).toBe(true);
    expect(_paq.some(call => call[0] === "trackContentImpressionsWithinNode")).toBe(true);

    document.body.removeChild(root);
  });
});

describe("useSearchTracking", () => {
  const SearchTestComponent = () => {
    useSearchTracking();
    return <div>Search Test</div>;
  };

  it("tracks search query when status is idle", () => {
    const _paq = getPaq();
    _paq.length = 0;

    (useInstantSearch as jest.Mock).mockImplementation(() => ({
      results: { query: "climate" },
      status: "idle",
    }));

    render(<SearchTestComponent />);

    expect(_paq.some(call => call[0] === "trackEvent" && call[2] === "Query" && call[3] === "climate")).toBe(true);
  });

  it("does not track if status is not idle", () => {
    const _paq = getPaq();
    _paq.length = 0;

    (useInstantSearch as jest.Mock).mockImplementation(() => ({
      results: { query: "climate" },
      status: "loading",
    }));

    render(<SearchTestComponent />);

    expect(_paq.some(call => call[0] === "trackEvent")).toBe(false);
  });

  it("does not track if query is empty", () => {
    const _paq = getPaq();
    _paq.length = 0;

    (useInstantSearch as jest.Mock).mockImplementation(() => ({
      results: { query: "" },
      status: "idle",
    }));

    render(<SearchTestComponent />);

    expect(_paq.some(call => call[0] === "trackEvent")).toBe(false);
  });
});
