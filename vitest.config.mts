import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
    },
    projects: [
      'packages/*',
      {
        // vitest types are wrong, false is allowed at runtime to not extend from the root config
        extends: false as any,
        test: {
          include: ['e2e'],
        },
      },
    ],
  },
});
