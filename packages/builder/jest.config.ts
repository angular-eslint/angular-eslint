/* eslint-disable */
export default {
  displayName: 'builder',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/builder',
  coverageReporters: ['text-summary', 'lcov'],
};
