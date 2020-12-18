/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */
const esModules = ['react-use-localstorage'].join('|');

module.exports = {
    roots: ['./src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.ts?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.ts',
    },
    testPathIgnorePatterns: [
        "src/lib/hooks/useUnit.ts"
    ],
    // setupFilesAfterEnv: ['./jest/jest.setup.ts'],
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    collectCoverage: true,
    coverageDirectory: './coverage',
    coverageReporters: ['html', 'text', 'text-summary',],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 90,
            statements: 90
        },
    },
    coveragePathIgnorePatterns: ['/node_modules/'],
};