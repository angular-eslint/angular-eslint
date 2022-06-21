/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import execa from 'execa';
import { join } from 'path';
import kill from 'tree-kill';

export const FIXTURES_DIR = join(__dirname, '../fixtures/');

// Used to ensure all the time-consuming setup steps for fixtures do not cause jest to time out
export const LONG_TIMEOUT_MS = 600000; // 10 mins

let localRegistryProcess: ChildProcess;

const VERSION = `9999.0.1-local-integration-tests`;

const cwd = process.cwd();

process.env.npm_config_registry = `http://localhost:4872/`;
process.env.YARN_REGISTRY = process.env.npm_config_registry;

export async function spawnLocalRegistry(): Promise<void> {
  localRegistryProcess = spawn('npx', [
    'verdaccio',
    '--config',
    './local-registry/config.yml',
    '--listen',
    '4872',
  ]);

  const collectedOutput: string[] = [];
  let resolvedOrRejected = false;

  setTimeout(() => {
    if (!resolvedOrRejected) {
      console.error(`Failed to start the npm registry`);
      console.error(collectedOutput.join(''));
      cleanUp(1);
    }
  }, 10000);

  await new Promise((res, rej) => {
    localRegistryProcess.stdout!.pipe(process.stdout);
    localRegistryProcess.stdout!.on('data', (data: Buffer) => {
      collectedOutput.push(data.toString());
      // wait for local-registry to come online
      if (data.includes('http address')) {
        resolvedOrRejected = true;
        res(undefined);
      }
    });
    localRegistryProcess.stderr!.pipe(process.stderr);
    localRegistryProcess.on('error', (err: Error) => {
      console.error(collectedOutput.join(''));
      resolvedOrRejected = true;
      rej(err);
    });
  });
}

export function cleanUp(code: number): void {
  process.chdir(cwd);

  // try and terminate everything first
  try {
    if (!process.env.CI) {
      kill(0);
    }
    // eslint-disable-next-line no-empty
  } catch {}
  try {
    if (localRegistryProcess) localRegistryProcess.kill();
    // eslint-disable-next-line no-empty
  } catch {}
  // try killing everything after in case something hasn't terminated
  try {
    if (!process.env.CI) {
      kill(0, 'SIGKILL');
    }
    // eslint-disable-next-line no-empty
  } catch {}
  try {
    if (localRegistryProcess) localRegistryProcess.kill('SIGKILL');
    // eslint-disable-next-line no-empty
  } catch {}

  process.exit(code);
}

export async function publishPackagesToVerdaccio(): Promise<
  execa.ExecaChildProcess<string>
> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('./publish-to-verdaccio.sh', [VERSION]);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runNpmInstall(): Promise<
  execa.ExecaChildProcess<string>
> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('npm', ['install']);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runYarnInstall(): Promise<
  execa.ExecaChildProcess<string>
> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('yarn', ['install']);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runNgAdd(): Promise<execa.ExecaChildProcess<string>> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
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
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runNgNew(
  workspaceName: string,
  createApplication = true,
): Promise<execa.ExecaChildProcess<string>> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const ngNewArgs = [
    `--strict=true`,
    `--package-manager=npm`,
    `--interactive=false`,
  ];

  if (!createApplication) {
    ngNewArgs.push(`--create-application=false`);
  }

  const subprocess = execa('../../../node_modules/.bin/ng', [
    'new',
    ...ngNewArgs,
    workspaceName,
  ]);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runNgGenerate(
  args: string[],
): Promise<execa.ExecaChildProcess<string>> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  const subprocess = execa('npx', ['ng', 'generate', ...args]);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}

export async function runConvertTSLintToESLint(
  additionalArgs?: string[],
): Promise<execa.ExecaChildProcess<string>> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }

  let args = ['ng', 'g', `@angular-eslint/schematics:convert-tslint-to-eslint`];
  if (additionalArgs) {
    args = [...args, ...additionalArgs];
  }

  const subprocess = execa('npx', args);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);

  return await subprocess;
}
