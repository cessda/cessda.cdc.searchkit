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

import React from "react";
import { render, screen } from "../../testutils";
import Panel from "../../../src/components/Panel";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../../src/components/Tooltip', () => ({
  Tooltip: ({ content }: { content: string | JSX.Element }) => <div>{content}</div>,
}));

it('should render title and children correctly', () => {
  render(
    <Panel title="Test Title">
      <p>Test Content</p>
    </Panel>
  );

  // Check if title is rendered
  expect(screen.getByText('Test Title')).toBeInTheDocument();

  // Check if children content is rendered
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});

it('should collapse and expand when clicked', async () => {
  render(
    <Panel title="Test Collapsable" collapsable={true} defaultCollapsed={true}>
      <p>Collapsable Content</p>
    </Panel>
  );

  const header = screen.getByTestId('panel-header');
  const content = screen.getByTestId('panel-content');

  // Initially content should be hidden (collapsed)
  expect(content).toHaveClass('collapsed');

  // Click the header to expand
  await userEvent.click(header);
  expect(content).not.toHaveClass('collapsed');

  // Click the header again to collapse
  await userEvent.click(header);
  expect(content).toHaveClass('collapsed');
});

it('should collapse and expand when using keyboard (Enter/Space)', async () => {
  render(
    <Panel title="Test Collapsable" collapsable={true} defaultCollapsed={true}>
      <p>Collapsable Content</p>
    </Panel>
  );

  const container = screen.getByTestId('panel-container');
  const content = screen.getByTestId('panel-content');

  // Initially content should be hidden (collapsed)
  expect(content).toHaveClass('collapsed');

  // Ensure the container is focused
  container.focus();

  // Simulate pressing "Enter" on the panel
  await userEvent.keyboard('{Enter}');
  expect(content).not.toHaveClass('collapsed');

  // Simulate pressing "Space" on the panel
  await userEvent.keyboard('{ }');
  expect(content).toHaveClass('collapsed');
});

it('should render the tooltip correctly', () => {
  render(
    <Panel title="Test Title" tooltip={<span>Tooltip Content</span>}>
      <p>Test Content</p>
    </Panel>
  );

  // Check if the tooltip content is rendered
  expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
});

it('should not collapse when collapsable is false', async () => {
  render(
    <Panel title="Non-Collapsable">
      <p>Non-Collapsable Content</p>
    </Panel>
  );

  const container = screen.getByTestId('panel-container');
  const header = screen.getByTestId('panel-header');
  const content = screen.getByTestId('panel-content');

  // Elements should not have collapsable class
  expect(container).not.toHaveClass('collapsable');
  expect(header).not.toHaveClass('collapsable');
  expect(content).not.toHaveClass('collapsable');

  // Clicking should not add collapsed class
  await userEvent.click(header);
  expect(container).not.toHaveClass('collapsed');
  expect(header).not.toHaveClass('collapsed');
  expect(content).not.toHaveClass('collapsed');
});

