import { defineConfig } from 'vitest/config';
import { workspaceRoot } from '@nx/devkit';
import { basename, join } from 'node:path';

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: join(
        workspaceRoot,
        'coverage/packages',
        basename(__dirname),
      ),
    },
  },
});
