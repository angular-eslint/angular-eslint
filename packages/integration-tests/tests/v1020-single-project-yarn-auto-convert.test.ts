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

const integrationTests: [string][] = [
  ['v1020-single-project-yarn-auto-convert'],
];

describe.each(integrationTests)('%s', (directory) => {
  it('it should pass linting after converting the out of the box Angular CLI setup (with a custom prefix set)', () => {
    expect(
      require('../fixtures/v1020-single-project-yarn-auto-convert/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1020-single-project-yarn-auto-convert/angular.json')
        .projects['v1020-single-project-yarn-auto-convert'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = runLint(directory);
    expect(lintOutput).toMatchSnapshot();
  });
});
