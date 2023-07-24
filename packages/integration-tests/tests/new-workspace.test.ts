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

const fixtureDirectory = 'new-workspace';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    await runNgAdd();
    await runNgGenerate(['app', 'another-app', '--interactive=false']);
    await runNgGenerate(['lib', 'another-lib', '--interactive=false']);
  });

  it('it should pass linting after creating a new workspace from scratch using @angular-eslint', async () => {
    // TSLint configs and dependencies should not be present
    expect(() =>
      require('../fixtures/new-workspace/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/new-workspace/tslint.json' from 'tests/new-workspace.test.ts'"`,
    );
    expect(
      JSON.stringify(
        requireUncached('../fixtures/new-workspace/package.json')
          .devDependencies,
        null,
        2,
      ),
    ).toMatchSnapshot();

    // Root project
    expect(
      requireUncached('../fixtures/new-workspace/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/new-workspace/angular.json').projects[
        'new-workspace'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(() =>
      require('../fixtures/new-workspace/projects/another-app/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/new-workspace/projects/another-app/tslint.json' from 'tests/new-workspace.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/new-workspace/projects/another-app/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/new-workspace/angular.json').projects[
        'another-app'
      ].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(() =>
      require('../fixtures/new-workspace/projects/another-lib/tslint.json'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot find module '../fixtures/new-workspace/projects/another-lib/tslint.json' from 'tests/new-workspace.test.ts'"`,
    );
    expect(
      requireUncached(
        '../fixtures/new-workspace/projects/another-lib/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached('../fixtures/new-workspace/angular.json').projects[
        'another-lib'
      ].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
