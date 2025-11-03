import { defineConfig } from 'vitest/config';
import { LONG_TIMEOUT_MS } from './utils/local-registry-process.js';

export default defineConfig({
  test: {
    globalSetup: './utils/global-setup.ts',
    hookTimeout: LONG_TIMEOUT_MS,
  },
});
