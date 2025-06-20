/* eslint-disable react/display-name */
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
import { render, screen, waitFor } from "../../testutils";
import DetailPage from "../../../src/containers/DetailPage";
import { mockStudy } from "../../common/mockdata";
import userEvent from '@testing-library/user-event';

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLoaderData: () => ({
    data: {
      payload: {
        study: mockStudy,
        similars: [
          { id: '123', title: 'Study 1' },
          { id: '456', title: 'Study 2' },
          { id: '789', title: 'Study 3' }
        ],
        availableLanguages: ['en', 'fi'],
      },
    },
  }),
  useLocation: () => ({
    state: { 
      from: "/",
     },
        pathname: "/detail/8a230ed2d3c48685bb93a5dfecc98a65f8c29ea47c0517aac8d71b16d4394f9b"
  }),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/components/Detail", () => () => <div>Detail component</div>);
// jest.mock("../../../src/components/DetailIndex", () => () => <div>DetailIndex component</div>);
jest.mock("../../../src/components/Similars", () => () => <div>Similars component</div>);

it("should render correctly", async () => {
  
  render(<DetailPage />);

  await waitFor(() => {
    expect(screen.getByText('Detail component')).toBeInTheDocument();
//    expect(screen.getByText('DetailIndex component')).toBeInTheDocument();
    expect(screen.getByText('Similars component')).toBeInTheDocument();
  });
});

it("should handle back button click and keydown", async () => {
  render(<DetailPage />);

  const backButton = screen.getByTestId("back-button");

  // Simulate button click
  userEvent.click(backButton);
  // Ensure navigate is called
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Ensure the button is focused
  backButton.focus();

  // Simulate keydown event
  userEvent.keyboard("{Enter}");
  
  // Ensure navigate is called again
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

it("renders JSON-LD script for the study", async () => {
  render(<DetailPage />);

  await waitFor(() => {
    const jsonLdElement = document.querySelector("#json-ld");
    expect(jsonLdElement).not.toBeNull();
    expect(jsonLdElement?.innerHTML).toContain('"@type":"Dataset"');
  });
});


it("renders available languages if no study found with selected language", async () => {
  // Override the mock for this specific test using jest.spyOn
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const useLoaderDataSpy = jest.spyOn(require('react-router'), 'useLoaderData');
  
  // Mock the return value for this test
  useLoaderDataSpy.mockReturnValueOnce({
    data: {
      payload: {
        study: undefined,
        similars: undefined,
        availableLanguages: ['fi'],
      },
    },
  });

  render(<DetailPage />);

  await waitFor(() => {
    expect(screen.getByTestId('available-languages')).toBeInTheDocument();
  });

  // Restore the original mock after the test
  useLoaderDataSpy.mockRestore();
});
