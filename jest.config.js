// @ts-check
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

/** @type {import('jest').Config} */
module.exports = {
  // Collect test coverage
  collectCoverage: true,
  coverageDirectory: './coverage',

  // Add the JUnit reporter so that test results can be displayed in Jenkins
  reporters: ['default', 'jest-junit'],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },

  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { plugins: ['@babel/plugin-transform-export-namespace-from', '@babel/plugin-transform-modules-commonjs'] }],
    "^.+\\.svg$": "jest-transformer-svg"
  },
  transformIgnorePatterns: [],
  // Setup Enzyme and fetch, this removes the need for imports in the tests
  setupFilesAfterEnv: ["<rootDir>setupTests.ts", "<rootDir>/src/i18n/config.ts"],
  testEnvironment: "jsdom",

  testMatch: ["**/tests/**/*.[tj]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/common/mockdata.ts", "/tests/testutils.tsx", "/tests/mocks/"],
  coveragePathIgnorePatterns: ["/node_modules/","/src/reducers/","/server/","/common/"]
 
};
