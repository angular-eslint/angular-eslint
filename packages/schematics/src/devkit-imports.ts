/**
 * In order to prevent the project graph cache from showing up at the root of the user's
 * workspace, we set a custom cache directory before importing anything from `@nx/devkit`.
 *
 * `no-restricted-imports` eslint rule has been configured for this project to prevent
 * accidental imports in other files. All imports should come from here to ensure consistency.
 */

import { join } from 'node:path';

process.env.NX_PROJECT_GRAPH_CACHE_DIRECTORY = join(
  __dirname,
  '..',
  '.nx-cache',
);

/* eslint-disable no-restricted-imports */
export {
  convertNxGenerator,
  offsetFromRoot,
  readJson,
  writeJson,
} from '@nx/devkit';
export type { ProjectConfiguration, Tree } from '@nx/devkit';
export { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
/* eslint-enable no-restricted-imports */
