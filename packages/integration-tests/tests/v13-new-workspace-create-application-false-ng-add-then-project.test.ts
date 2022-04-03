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

const fixtureDirectory =
  'v13-new-workspace-create-application-false-ng-add-then-project';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory, false);
    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));

    await runNgAdd();
    await runNgGenerate(['app', 'app-project', '--interactive=false']);
  });

  it('it should pass linting when adding a project before running ng-add', async () => {
    // TSLint configs and dependencies should not be present
    expect(() =>
      require('../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/tslint.json' from 'tests/v13-new-workspace-create-application-false-ng-add-then-project.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/package.json',
      ).devDependencies,
    ).toMatchSnapshot();

    // Root eslint config
    expect(
      requireUncached(
        '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    // App project ("app-project")
    expect(() =>
      require('../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/projects/app-project/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/projects/app-project/tslint.json' from 'tests/v13-new-workspace-create-application-false-ng-add-then-project.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/projects/app-project/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached(
        '../fixtures/v13-new-workspace-create-application-false-ng-add-then-project/angular.json',
      ).projects['app-project'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
