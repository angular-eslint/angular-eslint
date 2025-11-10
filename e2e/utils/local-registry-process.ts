/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { workspaceRoot } from '@nx/devkit';
import execa from 'execa';
import { join } from 'node:path';

// Used to ensure all the time-consuming setup steps for fixtures do not cause the test to time out
export const LONG_TIMEOUT_MS = 600000; // 10 mins

const publishedVersion = process.env.PUBLISHED_VERSION ?? '0.0.0-e2e';

export async function runCommandOnLocalRegistry(
  command: string,
  args: string[],
): Promise<execa.ExecaChildProcess<string>> {
  if (process.env.npm_config_registry?.indexOf('http://localhost') === -1) {
    throw Error(`
      ------------------
      💣 ERROR 💣 => $NPM_REGISTRY does not look like a local registry'
      ------------------
    `);
  }
  console.log(
    `\n[e2e debug output] Running command: ${command} ${args.join(' ')}\n`,
  );

  const subprocess = execa(command, args);
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);
  return await subprocess;
}

export async function runNpmInstall(): Promise<
  execa.ExecaChildProcess<string>
> {
  return await runCommandOnLocalRegistry('npm', ['install']);
}

export async function runNgAdd(): Promise<execa.ExecaChildProcess<string>> {
  /**
   * Force our e2e published version to be readily available on disk to
   * ensure that the @angular/cli resolves it correctly during `ng add`.
   * In practice, without this step it seems to be very inconsistent.
   */
  await runCommandOnLocalRegistry('npm', [
    'view',
    '@angular-eslint/schematics',
    'version',
  ]);
  await runCommandOnLocalRegistry('npm', [
    'install',
    '-D',
    `@angular-eslint/schematics@${publishedVersion}`,
  ]);

  return await runCommandOnLocalRegistry('npx', [
    'ng',
    'add',
    `@angular-eslint/schematics@${publishedVersion}`,
    `--skip-confirmation`,
  ]);
}

export async function runNgNew(
  workspaceName: string,
  createApplication = true,
): Promise<execa.ExecaChildProcess<string>> {
  const ngNewArgs = [
    `--strict=true`,
    `--package-manager=npm`,
    `--interactive=false`,
  ];
  if (!createApplication) {
    ngNewArgs.push(`--create-application=false`);
  }
  return await runCommandOnLocalRegistry(
    // Resolve the ng executable from the angular-eslint repo, so we know what version we're using
    join(workspaceRoot, 'node_modules/.bin/ng'),
    ['new', ...ngNewArgs, workspaceName],
  );
}

export async function runNgGenerate(
  args: string[],
): Promise<execa.ExecaChildProcess<string>> {
  return await runCommandOnLocalRegistry('npx', ['ng', 'generate', ...args]);
}
