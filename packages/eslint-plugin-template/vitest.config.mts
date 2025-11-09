import { workspaceRoot } from '@nx/devkit';
import { basename, join } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts', 'tests/**/spec.ts'],
    testTimeout: 30000,
    coverage: {
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
      reportsDirectory: join(
        workspaceRoot,
        'coverage/packages',
        basename(__dirname),
      ),
    },
  },
  resolve: {
    // Important for resolving a single copy of the bundled-angular-compiler package
    preserveSymlinks: true,
  },
});
