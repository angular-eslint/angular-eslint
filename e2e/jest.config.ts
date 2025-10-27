export default {
  displayName: 'e2e',
  preset: '../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/e2e',
  globalSetup: './utils/global-setup.ts',
  globalTeardown: './utils/global-teardown.ts',
};
