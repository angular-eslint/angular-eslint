import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
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
import { normalizeVersionsOfPackagesWeDoNotControl } from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);

const fixtureDirectory =
  'new-workspace-create-application-false-project-then-ng-add';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory, false);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    await runNgGenerate(['app', 'app-project', '--interactive=false']);
    await runNgAdd();
  });

  it('it should pass linting when ng-add is run before adding a project', async () => {
    // TSLint configs and dependencies should not be present
    expect(() =>
      require('../fixtures/new-workspace-create-application-false-project-then-ng-add/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/new-workspace-create-application-false-project-then-ng-add/tslint.json' from 'tests/new-workspace-create-application-false-project-then-ng-add.test.ts'"`,
    );
    expect(
      JSON.stringify(
        requireUncached(
          '../fixtures/new-workspace-create-application-false-project-then-ng-add/package.json',
        ).devDependencies,
        null,
        2,
      ),
    ).toMatchSnapshot();

    // Root eslint config
    expect(
      requireUncached(
        '../fixtures/new-workspace-create-application-false-project-then-ng-add/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    // App project ("app-project")
    expect(() =>
      require('../fixtures/new-workspace-create-application-false-project-then-ng-add/projects/app-project/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/new-workspace-create-application-false-project-then-ng-add/projects/app-project/tslint.json' from 'tests/new-workspace-create-application-false-project-then-ng-add.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/new-workspace-create-application-false-project-then-ng-add/projects/app-project/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached(
        '../fixtures/new-workspace-create-application-false-project-then-ng-add/angular.json',
      ).projects['app-project'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
