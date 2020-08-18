import * as execa from 'execa';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');

function normalizeOutput(value: string): string {
  return value.replace(new RegExp(FIXTURES_DIR, 'g'), '__ROOT__/');
}

function runLint(directory: string): unknown {
  try {
    const cwd = path.join(FIXTURES_DIR, directory);
    process.chdir(cwd);

    execa.sync(path.join(cwd, '../../install-fixture-deps.sh'), {
      cwd,
    });

    const { stdout: lintOutput } = execa.sync('npx', ['ng', 'lint'], {
      cwd,
    });

    return normalizeOutput(lintOutput);
  } catch (error) {
    return normalizeOutput(error.stdout || error);
  }
}

const integrationTests: [string][] = [['angular-cli-workspace']];

describe.each(integrationTests)('%s', (directory) => {
  it('it should produce the expected lint output', () => {
    const lintOutput = runLint(directory);
    expect(lintOutput).toMatchSnapshot();
  });
});
