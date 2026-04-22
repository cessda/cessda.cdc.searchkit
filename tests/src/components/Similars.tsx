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
import Similars, { Props } from "../../../src/components/Similars";
import { Similar } from "../../../common/metadata";

const renderComponent = (props: Props) => {
  render(<Similars {...props} />);
}

it('should render list of similar studies when data is provided', () => {
  const similars = [
    { id: '123', title: 'Study 1' },
    { id: '456', title: 'Study 2' },
    { id: '789', title: 'Study 3' }
  ];

  renderComponent({ similars });

  // Verify the heading is rendered
  expect(screen.getByText('Similar results')).toBeInTheDocument();

  // Verify the similar study titles are rendered as links
  similars.forEach(similar => {
    const link = screen.getByText(similar.title);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/detail/${similar.id}?lang=en`);
  });
});

it('should render "No similar results found." when no data is provided', () => {
  const similars: Similar[] = [];

  renderComponent({ similars });

  // Verify the fallback message is rendered
  expect(screen.getByText('No similar results found.')).toBeInTheDocument();
});

it('should generate correct URLs for each similar study', () => {
  const similars = [
    { id: 'abc', title: 'Study A' },
    { id: 'def', title: 'Study B' },
  ];

  renderComponent({ similars });

  similars.forEach(similar => {
    const link = screen.getByText(similar.title);
    expect(link).toHaveAttribute('href', `/detail/${similar.id}?lang=en`);
  });
});
