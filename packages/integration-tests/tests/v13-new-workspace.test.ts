/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import {
  FIXTURES_DIR,
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgGenerate,
  runNgNew,
} from '../utils/local-registry-process';
import { requireUncached } from '../utils/require-uncached';
import { runLint } from '../utils/run-lint';

const fixtureDirectory = 'v13-new-workspace';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory);

    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));
    await runNgAdd();
    await runNgGenerate(['app', 'another-app', '--interactive=false']);
    await runNgGenerate(['lib', 'another-lib', '--interactive=false']);
  });

  it('it should pass linting after creating a new workspace from scratch using @angular-eslint', async () => {
    // TSLint configs and dependencies should not be present
    expect(() =>
      require('../fixtures/v13-new-workspace/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v13-new-workspace/tslint.json' from 'tests/v13-new-workspace.test.ts'"`,
    );
    expect(
      requireUncached('../fixtures/v13-new-workspace/package.json')
        .devDependencies,
    ).toMatchSnapshot();

    // Root project
    expect(
      requireUncached('../fixtures/v13-new-workspace/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/v13-new-workspace/angular.json').projects[
        'v13-new-workspace'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(() =>
      require('../fixtures/v13-new-workspace/projects/another-app/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v13-new-workspace/projects/another-app/tslint.json' from 'tests/v13-new-workspace.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/v13-new-workspace/projects/another-app/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/v13-new-workspace/angular.json').projects[
        'another-app'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(() =>
      require('../fixtures/v13-new-workspace/projects/another-lib/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v13-new-workspace/projects/another-lib/tslint.json' from 'tests/v13-new-workspace.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/v13-new-workspace/projects/another-lib/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/v13-new-workspace/angular.json').projects[
        'another-lib'
      ].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
