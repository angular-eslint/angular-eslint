/* eslint-disable */
'use strict';

export default {
  displayName: 'eslint-plugin',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  testMatch: null,
  testRegex: ['./tests/.+\\.test\\.ts$', './tests/.+/spec\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/eslint-plugin',
  coverageReporters: ['text-summary', 'lcov'],
};
