// Copyright CESSDA ERIC 2017-2021
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
import { shallow } from 'enzyme';
import Footer from '../../../src/components/Footer';

// Mock props and shallow render component for test.
function setup() {
  const props = {};
  const enzymeWrapper = shallow(<Footer {...props} />);
  return {
    props,
    enzymeWrapper
  };
}

describe('Footer component', () => {
  it('should render', () => {
    const { enzymeWrapper } = setup();
    const footer = enzymeWrapper.find('footer');

    expect(footer.exists()).toBe(true);
  });

  it('should include logo', () => {
    const { enzymeWrapper } = setup();
    const logo = enzymeWrapper.find('#footerlogo');

    expect(logo.exists()).toBe(true);
  });

  it('should generate script with JSON-LD for organisation', () => {
    const { enzymeWrapper } = setup();
    const script = enzymeWrapper.find('script');

    expect(script.prop('type')).toEqual('application/ld+json');

    expect(JSON.parse(script.text())).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CESSDA ERIC',
      url: 'https://www.cessda.eu',
      sameAs: [
        'https://twitter.com/CESSDA_Data',
        'https://www.linkedin.com/company/9392869',
        'https://www.youtube.com/channel/UCqbZKb1Enh-WcFpg6t86wsA'
      ]
    });
  });
});
