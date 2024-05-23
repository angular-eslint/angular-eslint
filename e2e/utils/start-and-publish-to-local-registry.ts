import { joinPathFragments, workspaceRoot } from '@nx/devkit';
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { execFileSync } from 'node:child_process';
import { recreateFixturesDir } from './fixtures';

export const E2E_VERSION = '0.0.0-e2e';

export default async () => {
  // local registry target to run
  const localRegistryTarget = 'e2e:local-registry';
  // storage folder for the local registry
  const storage = joinPathFragments(
    workspaceRoot,
    'tmp/local-registry/storage',
  );

  // Teardown any previous fixtures and recreate the fixtures directory
  await recreateFixturesDir();

  // @ts-expect-error: assigned globally to share with stop-local-registry
  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: process.env.NX_VERBOSE_LOGGING === 'true',
  });
  const nx = require.resolve('nx');

  const execNx = (args: string[]) =>
    execFileSync(nx, args, {
      env: process.env,
      stdio: 'inherit',
      maxBuffer: 1024 * 1024 * 10,
      cwd: workspaceRoot,
    });

  // Do not stage the changed package.json files
  execNx(['release', 'version', E2E_VERSION, '--stage-changes=false']);

  // startLocalRegistry automatically configures the registry to point at the local registry
  execNx(['release', 'publish', '--tag', 'e2e']);
};
