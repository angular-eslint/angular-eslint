/* eslint-disable @typescript-eslint/no-var-requires */
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
  ['v1123-strict-multi-project-auto-convert'],
];

describe.each(integrationTests)('%s', (directory) => {
  it('it should pass linting after converting the out of the box Angular CLI setup (with an additional project called "another-app" with a custom prefix set)', () => {
    // Root project
    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/angular.json')
        .projects['v1123-strict-multi-project-auto-convert'].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/projects/another-app/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/angular.json')
        .projects['another-app'].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/projects/another-lib/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-strict-multi-project-auto-convert/angular.json')
        .projects['another-lib'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = runLint(directory);
    expect(lintOutput).toMatchSnapshot();
  });
});
