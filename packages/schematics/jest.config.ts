/* eslint-disable */
'use strict';

export default {
  displayName: 'schematics',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testMatch: null,
  testRegex: ['./tests/.+\\.test\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/schematics',
  coverageReporters: ['text-summary', 'lcov'],
};
