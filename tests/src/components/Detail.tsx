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

import '../../mocks/reacti18nMock';
import React from "react";
import { render, screen, waitFor, within } from "../../testutils";
import Detail, { Props } from "../../../src/components/Detail";
import { mockStudy } from "../../common/mockdata";
import userEvent from '@testing-library/user-event';

const baseProps: Props = {
  item: {
    ...mockStudy,
  },
  headings: [
    { summary: { id: 'summary-information', level: 'main', translation: "Summary" } },
    { title: { id: 'title', level: 'subtitle', translation: "Title" } },
    { creator: { id: 'creator', level: 'subtitle', translation: "Creator" } },
    { pid: { id: 'pid', level: 'subtitle', translation: "PID" } },
    { series: { id: 'series', level: 'subtitle', translation: "Series" } },
    { abstract: { id: 'abstract', level: 'subtitle', translation: "Abstract" } },
    { funding: { id: 'funding', level: 'title', translation: "Funding information" } },
    { collPeriod: { id: 'data-collection-period', level: 'subtitle', translation: ("Data collection period") } },
    { country: { id: 'country', level: 'subtitle', translation: ("Country") } },
    { universe: { id: 'universe', level: 'subtitle', translation: ("Universe") } },
    { publicationYear: { id: 'publication-year', level: 'subtitle', translation: ("Publication year") } },
    { relPub: { id: 'related-publications', level: 'subtitle', translation: ("Related publications") } }
  ]
};

const renderDetailWithModifiedProps = (modifiedProps: Partial<Props['item']>) => {
  render(<Detail {...baseProps} item={{ ...baseProps.item, ...modifiedProps }} />);
};

// Utility function to check if the heading is present and followed by a specific value
const checkValueAfterHeading = (headingText: string, expectedValue: string) => {
  const headingElement = screen.getByText(headingText);
  expect(headingElement).toBeInTheDocument();

  const nextElement = headingElement.nextElementSibling;
  expect(nextElement).toBeInTheDocument();
  expect(nextElement).toHaveTextContent(expectedValue);
};

it("should render with supplied item", () => {
  render(<Detail {...baseProps} />);
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle no pidStudies provided", () => {
  renderDetailWithModifiedProps({ pidStudies: [] });
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle a pidStudy with no agency", () => {
  renderDetailWithModifiedProps({ pidStudies: [{ pid: "TestPid", agency: "" }] });
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle no title provided", () => {
  renderDetailWithModifiedProps({ titleStudy: undefined });
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle no publisher provided", () => {
  renderDetailWithModifiedProps({ publisher: undefined });
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle no study number provided", () => {
  renderDetailWithModifiedProps({ studyNumber: undefined });
  expect(screen.getByRole('article')).toBeInTheDocument();
});

it("should handle generating elements with no value", () => {
  renderDetailWithModifiedProps({ studyAreaCountries: [] });
  checkValueAfterHeading('Country', 'language.notAvailable.field');
});

it("should handle formatting dates with missing data", () => {
  renderDetailWithModifiedProps({ publicationYear: undefined });
  checkValueAfterHeading('Publication year', 'language.notAvailable.field');
});

it("should handle special case where array items are a start/end date range", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: undefined,
    dataCollectionPeriodEnddate: undefined,
    dataCollectionFreeTexts: [
      { dataCollectionFreeText: "2003-02-01", event: "start" },
      { dataCollectionFreeText: "2006-05-04", event: "end" }
    ]
  });
  checkValueAfterHeading('Data collection period', '01/02/2003 - 04/05/2006');
});

it("should handle formatting dates with fallback array containing date range", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: undefined,
    dataCollectionPeriodEnddate: undefined,
    dataCollectionFreeTexts: [
      { dataCollectionFreeText: "2003-02-01", event: "" },
      { dataCollectionFreeText: "2006-05-04", event: "" }
    ]
  });
  checkValueAfterHeading('Data collection period', '01/02/2003');
});

it("should handle formatting dates with invalid first date", () => {
  renderDetailWithModifiedProps({ publicationYear: "Not a date" });
  checkValueAfterHeading('Publication year', 'Not a date');
});

it("should handle formatting dates as a range with invalid first date", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: 'Not a date',
    dataCollectionPeriodEnddate: '2006-05-04'
  });
  checkValueAfterHeading('Data collection period', 'Not a date - 04/05/2006');
});

it("should handle formatting dates as a range with valid second date", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: '2003-02-01',
    dataCollectionPeriodEnddate: '2006-05-04'
  });
  checkValueAfterHeading('Data collection period', '01/02/2003 - 04/05/2006');
});

it("should handle formatting dates as a range with invalid second date", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: '2003-02-01',
    dataCollectionPeriodEnddate: 'Not a date'
  });
  checkValueAfterHeading('Data collection period', '01/02/2003 - Not a date');
});

it("should handle formatting dates as a range with valid second date but undefined first date", () => {
  renderDetailWithModifiedProps({
    dataCollectionPeriodStartdate: undefined,
    dataCollectionPeriodEnddate: '2006-05-04'
  });
  checkValueAfterHeading('Data collection period', 'language.notAvailable.field');
});

it("should render related publications sorted by publication date", () => {
  renderDetailWithModifiedProps({
    relatedPublications: [
      {
        title: "Oldest related publication",
        holdings: [],
        publicationDate: "2015"
      },
      {
        title: "Newest related publication",
        holdings: [],
        publicationDate: "2023"
      },
      {
        title: "Undated related publication",
        holdings: [],
        publicationDate: ""
      }
    ]
  });

  const newest = screen.getByText("Newest related publication");
  const oldest = screen.getByText("Oldest related publication");
  const undated = screen.getByText("Undated related publication");

  // Assert order: newest -> oldest -> undated
  expect(newest.compareDocumentPosition(oldest) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(oldest.compareDocumentPosition(undated) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("should handle no universe exclusion provided", () => {
  renderDetailWithModifiedProps({ universe: { exclusion: undefined, inclusion: 'Exampled studied cohort' } });
  checkValueAfterHeading('Universe', 'Exampled studied cohort');
});

it("should select json and trigger export metadata process", async () => {
  // Spy on document.createElement
  const createElementSpy = jest.spyOn(document, 'createElement');

  // Mock fetch
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ some: 'data' }),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: '',
  } as Response);

  global.fetch = mockFetch;

  // Mock URL.createObjectURL and URL.revokeObjectURL
  const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/some-blob-url');
  const mockRevokeObjectURL = jest.fn();

  // Apply the mocks to global.URL
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  render(<Detail {...baseProps} />);

  // Simulate user clicking on the select box to open the dropdown
  const inputElement = screen.getByRole('combobox', { name: 'Export metadata' });
  userEvent.click(inputElement);

  // Simulate selecting the "json" option
  const jsonOption = await screen.findByText('JSON');
  userEvent.click(jsonOption);

  // Simulate clicking the export button
  const exportMetadataButton = screen.getByTestId('export-metadata-button');
  userEvent.click(exportMetadataButton);

  // Now, wait for the async operations to complete and assert the correct behavior
  await waitFor(() => {
    // Assertions to ensure the export process was triggered
    expect(mockFetch).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(`${window.location.origin}/api/json/cmmstudy_en/1`);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  // Clean up the spies after the test
  createElementSpy.mockRestore();
  (global.fetch as jest.Mock).mockRestore();
  (global.URL.createObjectURL as jest.Mock).mockRestore();
  (global.URL.revokeObjectURL as jest.Mock).mockRestore();
});

it("should handle fetch failure and log error", async () => {
  // Mock fetch to simulate a failure
  const mockFetch = jest.fn().mockResolvedValue({
    ok: false, // Simulate failure
    json: async () => ({ some: 'data' }), // This will not be used
    headers: new Headers(),
    redirected: false,
    status: 500,
    statusText: 'Internal Server Error',
    type: 'basic',
    url: '',
  } as Response);

  global.fetch = mockFetch;

  // Mock URL.createObjectURL and URL.revokeObjectURL
  const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/some-blob-url');
  const mockRevokeObjectURL = jest.fn();

  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  // Spy on console.error
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

  render(<Detail {...baseProps} />);

  // Simulate user clicking on the select box to open the dropdown
  const inputElement = screen.getByRole('combobox', { name: 'Export metadata' });
  userEvent.click(inputElement);

  // Simulate selecting the "json" option
  const jsonOption = await screen.findByText('JSON');
  userEvent.click(jsonOption);

  // Simulate clicking the export button
  const exportMetadataButton = screen.getByTestId('export-metadata-button');
  userEvent.click(exportMetadataButton);

  // Wait for async operations to complete
  await waitFor(() => {
    // Ensure the fetch call was made
    expect(mockFetch).toHaveBeenCalled();

    // Check if the createObjectURL and revokeObjectURL were not called due to failure
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();

    // Check if the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch JSON data');
  });

  // Clean up mocks and spies
  (global.fetch as jest.Mock).mockRestore();
  (global.URL.createObjectURL as jest.Mock).mockRestore();
  (global.URL.revokeObjectURL as jest.Mock).mockRestore();
  consoleErrorSpy.mockRestore();
});

it('should expand abstract on click', async () => {
  const longLoremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50) +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(30) +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. '.repeat(20) +
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. '.repeat(15);
  renderDetailWithModifiedProps({ abstract: longLoremIpsum });

  // Verify initial state
  const toggleButton = screen.getByTestId('expand-abstract');
  expect(toggleButton).toBeInTheDocument();
  const { getByText, queryByText } = within(toggleButton);
  expect(getByText('readMore')).toBeInTheDocument();
  expect(queryByText('readLess')).toBeNull();

  // Simulate clicking the toggle button
  userEvent.click(toggleButton);

  // Verify state after clicking
  await waitFor(() => {
    expect(getByText('readLess')).toBeInTheDocument();
    expect(queryByText('readMore')).toBeNull();
  });
});



it('should add funding information if it exists', async () => {
  const fundingData = [
    {
      agency: "Some Agency",
      grantNumber: "ID000"
    },
    {
      agency: "Another Agency",
      grantNumber: "1234"
    },
    {
      grantNumber: "IdButNoAgency"
    },
    {
      agency: "Finnish Agency"
    }
  ];

  renderDetailWithModifiedProps({ funding: fundingData });

  // Funding section should exist
  const fundingSection = screen.getByTestId('funding');
  expect(fundingSection).toBeInTheDocument();

  // Funding title should exist
  const fundingTitle = await screen.findByText('Funding information');
  expect(fundingTitle).toBeInTheDocument();

  // Check for each agency and grantNumber in the funding data
  fundingData.forEach((funding) => {
    if (funding.agency) {
      expect(within(fundingSection).getByText(funding.agency)).toBeInTheDocument();
    }

    if (funding.grantNumber) {
      expect(within(fundingSection).getByText(funding.grantNumber)).toBeInTheDocument();
    }
  });
});

it('should not add funding information if it does not exist', () => {
  renderDetailWithModifiedProps({ funding: [] });

  // Attempt to find the funding information section
  const fundingSection = screen.queryByText('Funding');

  // Expect it to not be present in the document
  expect(fundingSection).toBe(null);
});

it('should format data kind values from free texts, types and general data formats into one array', () => {
  render(<Detail {...baseProps} />);
  const expectedOutput = [
    "Quantitative",
    "Numeric",
    "Software",
    "Text",
    "Other"
  ];

  const dataKindDivs = screen.getAllByTestId('data-kind');
  const dataKindValues = dataKindDivs.map(div => div.textContent?.trim()).filter(Boolean);

  expect(dataKindValues).toEqual(expectedOutput);
});

it('should format creators correctly', () => {
  render(<Detail {...baseProps} />);

  const creatorElements = screen.getAllByTestId('creator');
  expect(creatorElements.length).toBe(mockStudy.creators.length);

  // Check each creator element
  mockStudy.creators.forEach((creator, index) => {
    const creatorElement = creatorElements[index];

    // Check if creator's name is rendered
    expect(creatorElement).toHaveTextContent(creator.name);

    // Check if affiliation is rendered correctly
    if (creator.affiliation) {
      expect(creatorElement).toHaveTextContent(`(${creator.affiliation})`);
    }

    const expectedIdentifierType = creator.identifier
    ? (creator.identifier.type?.toLowerCase() === "orcid" ? null : `${creator.identifier.type || "Research Identifier"}: `)
    : '';

    // Check if identifier is rendered correctly
    if (creator.identifier) {
      if (expectedIdentifierType) {
        expect(creatorElement).toHaveTextContent(expectedIdentifierType);
      } else if (creator.identifier?.type?.toLowerCase() === "orcid") {
        const orcidLogo = screen.getByLabelText('ORCID logo');
        expect(orcidLogo).toBeInTheDocument();
      }

      if (creator.identifier.uri) {
        // Check if the link is present and correct
        const link = creatorElement.querySelector('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', creator.identifier.uri);
        expect(link).toHaveTextContent(creator.identifier.id || creator.identifier.uri);
      } else if (creator.identifier.id) {
        expect(creatorElement).toHaveTextContent(creator.identifier.id);
      }
    }
  });
});

it('should make urls clickable in abstract and terms of data access', async () => {
  renderDetailWithModifiedProps({
    abstract: 'This is a mock abstract describing a mock study.\n\n' +
      'This mock abstract also includes links to http://www.example.com?param=(test), http://www.example.com?param=[test] and http://www.example.com. ' +
      'Link with tags already in it: <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">Already existing link</a>.',
    dataAccessFreeTexts: [
      "Data access terms and conditions (http://www.example.com) and another link for testing [https://www.example.com]."
    ],
  });

  const abstractElement = screen.getByTestId('abstract-full')
  expect(abstractElement).toBeInTheDocument();
  const abstractHTML = abstractElement.innerHTML || '';
  expect(abstractHTML).toContain('<a href="http://www.example.com?param=(test)" target="_blank" rel="noopener noreferrer">http://www.example.com?param=(test)</a>,');
  expect(abstractHTML).toContain('<a href="http://www.example.com?param=[test]" target="_blank" rel="noopener noreferrer">http://www.example.com?param=[test]</a>');
  expect(abstractHTML).toContain('<a href="http://www.example.com" target="_blank" rel="noopener noreferrer">http://www.example.com</a>.');
  expect(abstractHTML).toContain('<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">Already existing link</a>.');

  const accessTermsElement = screen.getByTestId('access-terms');
  expect(accessTermsElement).toBeInTheDocument();
  const termsOfDataAccessHTML = accessTermsElement.innerHTML || '';
  expect(termsOfDataAccessHTML).toContain('(<a href="http://www.example.com" target="_blank" rel="noopener noreferrer">http://www.example.com</a>)');
  expect(termsOfDataAccessHTML).toContain('[<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">https://www.example.com</a>].');
});

it('should make DOIs clickable in permanent identifiers', async () => {
  renderDetailWithModifiedProps({ pidStudies: [
    { pid: "10.60686/t-fsd3907", agency: "DOI" },
    { pid: "doi:10.0000/test", agency: "" },
    { pid: "10.0001/test", agency: "" },
    { pid: "10.0002/test", agency: "incorrectagency" },
    { pid: "11.0000/incorrectprefix", agency: "" },
    { pid: "http://doi.org/10.0003/test", agency: "" }
  ] });
  const expectedOutput = [
    '<a href="https://doi.org/10.60686/t-fsd3907" target="_blank" rel="noopener noreferrer">https://doi.org/10.60686/t-fsd3907</a> (DOI)',
    '<a href="https://doi.org/10.0000/test" target="_blank" rel="noopener noreferrer">https://doi.org/10.0000/test</a>',
    '<a href="https://doi.org/10.0001/test" target="_blank" rel="noopener noreferrer">https://doi.org/10.0001/test</a>',
    '10.0002/test (incorrectagency)',
    '11.0000/incorrectprefix',
    '<a href="https://doi.org/10.0003/test" target="_blank" rel="noopener noreferrer">https://doi.org/10.0003/test</a>',
  ];

  const pidElements = screen.getAllByTestId('pid');
  expect(pidElements).toHaveLength(6);
  expect(pidElements.map(p => p.innerHTML)).toEqual(expectedOutput);
});
