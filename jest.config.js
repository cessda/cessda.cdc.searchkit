// Copyright CESSDA ERIC 2017-2019
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

module.exports = {
  // Collect test coverage
  collectCoverage: true,
  coverageDirectory: './coverage',

  // Add the JUnit reporter so that test results can be displayed in Jenkins
  reporters: ['default', 'jest-junit'],

  // Setup Enzyme, this removes the need for imports in the tests
  setupFilesAfterEnv: ["jest-enzyme"],
  testEnvironment: "enzyme",
  testEnvironmentOptions: {
    enzymeAdapter: "react15"
  },
  testMatch: ['**/tests/**/*.js']
};
