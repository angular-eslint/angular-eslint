/* eslint-disable */
'use strict';

export default {
  displayName: 'eslint-plugin-template',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/eslint-plugin-template',
  coverageReporters: ['text-summary', 'lcov'],
};
