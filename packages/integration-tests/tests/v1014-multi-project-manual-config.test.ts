import * as execa from 'execa';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');

function normalizeOutput(value: string): string {
  return value.replace(
    new RegExp(`^${FIXTURES_DIR.replace(/\\/g, '\\\\')}(.*?)$`, 'gm'),
    (_, c1) => `__ROOT__/${c1.replace(/\\/g, '/')}`,
  );
}

function runLint(directory: string): string | undefined {
  try {
    const cwd = path.join(FIXTURES_DIR, directory);
    process.chdir(cwd);

    const { stdout: lintOutput } = execa.sync('npx', ['ng', 'lint'], {
      cwd,
    });

    return normalizeOutput(lintOutput);
  } catch (error) {
    return normalizeOutput(error.stdout || error);
  }
}

const integrationTests: [string][] = [['v1014-multi-project-manual-config']];

describe.each(integrationTests)('%s', (directory) => {
  it('it should produce the expected lint output', () => {
    const lintOutput = runLint(directory);
    expect(lintOutput).toMatchSnapshot();
  });
});
