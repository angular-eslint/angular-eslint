import execa from 'execa';
const { spawn } = require('child_process');
const kill = require('tree-kill');

let localRegistryProcess: any;

const VERSION = `9999.0.1-local-integration-tests`;

const cwd = process.cwd();

process.env.npm_config_registry = `http://localhost:4872/`;
process.env.YARN_REGISTRY = process.env.npm_config_registry;

async function spawnLocalRegistry() {
  localRegistryProcess = spawn('npx', [
    'verdaccio',
    '--config',
    './local-registry/config.yml',
    '--listen',
    '4872',
  ]);

  let collectedOutput: string[] = [];
  let resolvedOrRejected = false;

  setTimeout(() => {
    if (!resolvedOrRejected) {
      console.error(`Failed to start the npm registry`);
      console.error(collectedOutput.join(''));
      cleanUp(1);
    }
  }, 10000);

  await new Promise((res, rej) => {
    localRegistryProcess.stdout.pipe(process.stdout);
    localRegistryProcess.stdout.on('data', (data: Buffer) => {
      collectedOutput.push(data.toString());
      // wait for local-registry to come online
      if (data.includes('http address')) {
        resolvedOrRejected = true;
        res();
      }
    });
    localRegistryProcess.stderr.pipe(process.stderr);
    localRegistryProcess.on('error', (err: Error) => {
      console.error(collectedOutput.join(''));
      resolvedOrRejected = true;
      rej(err);
    });
  });
}

async function publishPackagesToVerdaccio() {
  if (process.env.npm_config_registry!.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('./publish-to-verdaccio.sh', [VERSION]);
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);

  return await subprocess;
}

async function runNpmInstall() {
  if (process.env.npm_config_registry!.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('npm', ['install']);
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);

  return await subprocess;
}

async function runYarnInstall() {
  if (process.env.npm_config_registry!.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('yarn', ['install']);
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);

  return await subprocess;
}

async function runNgAdd() {
  if (process.env.npm_config_registry!.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('npx', [
    'ng',
    'add',
    `@angular-eslint/schematics@${VERSION}`,
  ]);
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);

  return await subprocess;
}

async function runConvertTSLintToESLint(projectName: string) {
  if (process.env.npm_config_registry!.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('npx', [
    'ng',
    'g',
    `@angular-eslint/schematics:convert-tslint-to-eslint`,
    '--project',
    projectName,
  ]);
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);

  return await subprocess;
}

async function setupFixtures() {
  try {
    // @ts-ignore
    await spawnLocalRegistry();
    await publishPackagesToVerdaccio();

    process.chdir('fixtures/v1014-multi-project-manual-config');
    await runNpmInstall();
    await runNgAdd();

    process.chdir('../v1020-single-project-yarn-auto-convert');
    await runYarnInstall();
    await runNgAdd();
    await runConvertTSLintToESLint('v1020-single-project-yarn-auto-convert');

    process.chdir('../v1020-multi-project-yarn-auto-convert');
    await runYarnInstall();
    await runNgAdd();
    // Deliberately don't convert the root project first, so we can ensure this is also supported
    await runConvertTSLintToESLint('another-app');
    await runConvertTSLintToESLint('v1020-multi-project-yarn-auto-convert'); // root project
    await runConvertTSLintToESLint('another-lib');

    process.chdir('../v1101-strict-multi-project-auto-convert');
    await runYarnInstall();
    await runNgAdd();
    // Convert the root project first
    await runConvertTSLintToESLint('v1101-strict-multi-project-auto-convert');
    await runConvertTSLintToESLint('another-app');
    await runConvertTSLintToESLint('another-lib');

    cleanUp(0);
  } catch (e) {
    console.log(e);
    cleanUp(1);
  }
}

function cleanUp(code: number) {
  process.chdir(cwd);

  // try and terminate everything first
  try {
    if (!process.env.CI) {
      kill(0);
    }
  } catch (e) {}
  try {
    if (localRegistryProcess) localRegistryProcess.kill(0);
  } catch (e) {}
  // try killing everything after in case something hasn't terminated
  try {
    if (!process.env.CI) {
      kill(0, 'SIGKILL');
    }
  } catch (e) {}
  try {
    if (localRegistryProcess) localRegistryProcess.kill(0, 'SIGKILL');
  } catch (e) {}

  process.exit(code);
}

process.on('SIGINT', () => cleanUp(1));

setupFixtures()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((e) => {
    console.error('error', e);
    process.exit(1);
  });
