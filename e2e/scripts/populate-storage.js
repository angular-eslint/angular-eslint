// @ts-check

const { workspaceRoot } = require('@nx/devkit');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const { join } = require('node:path');

async function populateLocalRegistryStorage() {
  const storageDir = join(workspaceRoot, 'dist', 'local-registry', 'storage');
  // Clean up previous storage for our own packages, if we are running this it must be invalid at this point
  rmSync(join(storageDir, '@angular-eslint'), { recursive: true, force: true });
  rmSync(join(storageDir, 'angular-eslint'), { recursive: true, force: true });

  const listenAddress = 'localhost';
  const port = process.env.NX_LOCAL_REGISTRY_PORT ?? '4873';
  const registry = `http://${listenAddress}:${port}`;
  const authToken = 'secretVerdaccioToken';

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      await assertLocalRegistryIsRunning(registry);
      break;
    } catch {
      console.log(`Waiting for Local registry to start on ${registry}...`);
    }
  }

  process.env.npm_config_registry = registry;

  // bun
  process.env.BUN_CONFIG_REGISTRY = registry;
  process.env.BUN_CONFIG_TOKEN = authToken;
  // yarnv1
  process.env.YARN_REGISTRY = registry;
  // yarnv2
  process.env.YARN_NPM_REGISTRY_SERVER = registry;
  process.env.YARN_UNSAFE_HTTP_WHITELIST = listenAddress;

  try {
    const publishVersion = process.env.PUBLISHED_VERSION ?? '0.0.0-e2e';
    const isVerbose = process.env.NX_VERBOSE_LOGGING === 'true';

    console.log('Publishing packages to local registry to populate storage');
    await runLocalRelease(publishVersion, isVerbose);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
exports.populateLocalRegistryStorage = populateLocalRegistryStorage;

function runLocalRelease(publishVersion, isVerbose) {
  return new Promise((res, rej) => {
    const nx = require.resolve('nx');

    const execNx = (args) =>
      execFileSync(nx, args, {
        env: process.env,
        stdio: 'inherit',
        maxBuffer: 1024 * 1024 * 10,
        cwd: workspaceRoot,
      });

    // Do not stage the changed package.json files
    execNx([
      'release',
      'version',
      publishVersion,
      '--stage-changes=false',
      `--verbose=${!!isVerbose}`,
    ]);

    // startLocalRegistry automatically configures the registry to point at the local registry
    execNx([
      'release',
      'publish',
      '--tag',
      'latest',
      `--verbose=${!!isVerbose}`,
    ]);

    res(undefined);
  });
}
exports.runLocalRelease = runLocalRelease;

async function assertLocalRegistryIsRunning(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
