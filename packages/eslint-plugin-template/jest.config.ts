/* eslint-disable */
'use strict';

export default {
  displayName: 'eslint-plugin-template',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/eslint-plugin-template',
  coverageReporters: ['text-summary', 'lcov'],
};
