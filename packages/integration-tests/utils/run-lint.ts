/* eslint-disable @typescript-eslint/no-non-null-assertion */
import execa from 'execa';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripAnsi = require('strip-ansi');

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');

function normalizeOutput(value: string): string {
  const ansiRemoved: string = stripAnsi(value);
  return (
    ansiRemoved
      .replace(
        new RegExp(`^${FIXTURES_DIR.replace(/\\/g, '\\\\')}(.*?)$`, 'gm'),
        (_, c1) => `__ROOT__/${c1.replace(/\\/g, '/')}`,
      )
      /**
       * This one is ridiculous...
       *
       * No matter what I try (including the use of `strip-ansi`), I do not seem to be
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
