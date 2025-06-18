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

import { act, render, screen, waitFor } from "../../testutils";
import Tooltip, { TooltipProps } from '../../../src/components/Tooltip';
import React from 'react';
import userEvent from '@testing-library/user-event';

const baseProps: TooltipProps = {
  content: "Content",
  ariaLabel: "Aria label",
  classNames: {container: 'mt-10-negative ml-1'}
};

it('should render', () => {
  render(<Tooltip {...baseProps} />);
  const tooltipButton = screen.getByTestId('tooltip-button');
  expect(tooltipButton).toBeInTheDocument();
});

it('should display content on hover', async () => {
  render(<Tooltip {...baseProps} />);
  const tooltipIcon = screen.getByTestId('tooltip-icon');
  userEvent.hover(tooltipIcon);

  // Wait for the tooltip content to appear
  await waitFor(() => {
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  expect(screen.getByText(baseProps.content)).toBeInTheDocument();
});

it('should hide content on mouse leave', async () => {
  render(<Tooltip {...baseProps} />);
  
  const tooltipIcon = screen.getByTestId('tooltip-icon');
  userEvent.hover(tooltipIcon);
  
  // Wait for the tooltip content to appear
  await waitFor(() => {
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  userEvent.unhover(tooltipIcon);
  
  // Wait for tooltip content to disappear
  await waitFor(() => {
    expect(screen.queryByTestId('tooltip-content')).toBeNull();
  });
});

it('should toggle content on button click', async () => {
  render(<Tooltip {...baseProps} />);
  
  const tooltipButton = screen.getByTestId('tooltip-button');
  
  // Click to activate the tooltip
  userEvent.click(tooltipButton);
  
  // Wait for the tooltip content to appear
  await waitFor(() => {
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  // Click again to deactivate the tooltip
  userEvent.click(tooltipButton);
  
  // Wait for the tooltip content to disappear
  await waitFor(() => {
    expect(screen.queryByTestId('tooltip-content')).toBeNull();
  });
});

it('should hide content on Escape key press', async () => {
  render(<Tooltip {...baseProps} />);
  
  const tooltipButton = screen.getByTestId('tooltip-button');

  // Focus tooltip button
  tooltipButton.focus();

  // Simulate Escape key press
  userEvent.keyboard('{Enter}');

  // Wait for the tooltip content to appear
  await waitFor(() => {
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  // Simulate Escape key press
  userEvent.keyboard('{Escape}');

  // Wait for tooltip content to disappear
  await waitFor(() => {
    expect(screen.queryByTestId('tooltip-content')).toBeNull();
  });
});

it('should hide content on blur', async () => {
  render(
    <>
      <Tooltip {...baseProps} />
      <button data-testid="after-tooltip">Next</button>
    </>
  );

  const tooltipButton = screen.getByTestId('tooltip-button');

  // Ensure the tooltip button is focused
  tooltipButton.focus();

  // Simulate Escape key press
  userEvent.keyboard('{Enter}');

  // Wait for the tooltip content to appear
  await waitFor(() => {
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  // First tab: focus moves to tooltip content
  userEvent.tab();

  // Second tab: focus moves to the next button, triggering blur
  userEvent.tab();

  // Wait for the tooltip content to disappear
  await waitFor(() => {
    expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
  });
});

it('should handle positioning near bottom of the viewport', async () => {
  // Adjust the height of the window so that tooltip should be placed above
  // (even though it doesn't really have enough room there either in this case)
  window.innerHeight = 100;

  // Mock getBoundingClientRect before rendering
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      bottom: 90, // close to bottom
      top: 70,
      left: 0,
      right: 0,
      height: 20,
      width: 20,
    }),
  });

  render(<Tooltip {...baseProps} />);
  const tooltipButton = screen.getByTestId('tooltip-button');

  await act(async () => {
    await userEvent.click(tooltipButton);
  });

  await waitFor(() => {
    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('tooltip-above');
  });
});
