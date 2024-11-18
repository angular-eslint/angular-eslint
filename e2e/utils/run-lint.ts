/* eslint-disable @typescript-eslint/no-non-null-assertion */
import execa from 'execa';
import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { FIXTURES_DIR } from './fixtures';

function normalizeOutput(value: unknown): string {
  const ansiRemoved = stripVTControlCharacters(String(value));
  return (
    ansiRemoved
      .replace(
        new RegExp(`^${FIXTURES_DIR.replace(/\\/g, '\\\\')}(.*?)$`, 'gm'),
        (_, c1) => `__ROOT__/${c1.replace(/\\/g, '/')}`,
      )
      /**
       * This one is ridiculous...
       *
       * No matter what I try (including the use of `stripVTControlCharacters`), I do not seem to be
       * able to stop the inclusion of this extra `m` any other way (it is presumably
       * coming from an ANSI code becuase of its initial appearance in CI as [27m).
       * It happens locally and CI... but only exactly once.
       */
      .replace('mmax-len', 'max-len')
  );
}

export async function runLint(directory: string): Promise<string | undefined> {
  try {
    const subprocess = execa('npx', ['ng', 'lint'], {
      cwd: path.join(FIXTURES_DIR, directory),
    });

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    subprocess.stdout!.pipe(process.stdout);
    subprocess.stderr!.pipe(process.stderr);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const { stdout } = await subprocess;

    return normalizeOutput(stdout);
  } catch (error: any) {
    return normalizeOutput(error.stdout || error);
  }
}

export async function runLintFix(directory: string): Promise<void> {
  const subprocess = execa('npx', ['ng', 'lint', '--fix'], {
    cwd: path.join(FIXTURES_DIR, directory),
  });

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  subprocess.stdout!.pipe(process.stdout);
  subprocess.stderr!.pipe(process.stderr);
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  await subprocess;
}
