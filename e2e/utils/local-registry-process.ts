/* eslint-disable @typescript-eslint/no-non-null-assertion */
import execa from 'execa';
import { E2E_VERSION } from './start-and-publish-to-local-registry';

// Used to ensure all the time-consuming setup steps for fixtures do not cause jest to time out
export const LONG_TIMEOUT_MS = 600000; // 10 mins

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
  return await runCommandOnLocalRegistry('npx', [
    'ng',
    'add',
    `@angular-eslint/schematics@${E2E_VERSION}`,
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
  return await runCommandOnLocalRegistry('../../node_modules/.bin/ng', [
    'new',
    ...ngNewArgs,
    workspaceName,
  ]);
}

export async function runNgGenerate(
  args: string[],
): Promise<execa.ExecaChildProcess<string>> {
  return await runCommandOnLocalRegistry('npx', ['ng', 'generate', ...args]);
}
