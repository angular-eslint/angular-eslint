import { defineConfig } from 'vitest/config';
import { workspaceRoot } from '@nx/devkit';
import { basename, join } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts', 'tests/**/spec.ts'],
    testTimeout: 30000,
    coverage: {
      reportsDirectory: join(
        workspaceRoot,
        'coverage/packages',
        basename(__dirname),
      ),
    },
  },
});
