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

const integrationTests: [string][] = [['v11-new-workspace']];

describe.each(integrationTests)('%s', (directory) => {
  it('it should pass linting after creating a new workspace from scratch using @angular-eslint', () => {
    // TSLint configs and dependencies should not be present
    expect(() =>
      require('../fixtures/v11-new-workspace/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v11-new-workspace/tslint.json' from 'tests/v11-new-workspace.test.ts'"`,
    );
    expect(
      require('../fixtures/v11-new-workspace/package.json').devDependencies,
    ).toMatchSnapshot();

    // Root project
    expect(
      require('../fixtures/v11-new-workspace/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v11-new-workspace/angular.json').projects[
        'v11-new-workspace'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(() =>
      require('../fixtures/v11-new-workspace/projects/another-app/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v11-new-workspace/projects/another-app/tslint.json' from 'tests/v11-new-workspace.test.ts'"`,
    );
    expect(
      require('../fixtures/v11-new-workspace/projects/another-app/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v11-new-workspace/angular.json').projects[
        'another-app'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(() =>
      require('../fixtures/v11-new-workspace/projects/another-lib/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v11-new-workspace/projects/another-lib/tslint.json' from 'tests/v11-new-workspace.test.ts'"`,
    );
    expect(
      require('../fixtures/v11-new-workspace/projects/another-lib/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v11-new-workspace/angular.json').projects[
        'another-lib'
      ].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = runLint(directory);
    expect(lintOutput).toMatchSnapshot();
  });
});
