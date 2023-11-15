/* eslint-disable */
export default {
  displayName: 'e2e',
  preset: '../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/e2e',
  globalSetup: './utils/start-and-publish-to-local-registry.ts',
  globalTeardown: './utils/stop-local-registry.ts',
};
