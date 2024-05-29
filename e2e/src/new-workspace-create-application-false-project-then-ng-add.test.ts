import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import { FIXTURES_DIR, Fixture } from '../utils/fixtures';
import {
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgGenerate,
  runNgNew,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';
import { normalizeVersionsOfPackagesWeDoNotControl } from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);

const fixtureDirectory =
  'new-workspace-create-application-false-project-then-ng-add';
let fixture: Fixture;

describe('new-workspace-create-application-false-project-then-ng-add', () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeAll(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory, false);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    fixture = new Fixture(workspaceRoot);

    await runNgGenerate(['app', 'app-project', '--interactive=false']);
    await runNgAdd();
  });

  it('should pass linting when adding a project before running ng-add', async () => {
    // TSLint configs and dependencies should not be present
    expect(fixture.fileExists('tslint.json')).toBe(false);

    // It should contain eslint v9 and typescript-eslint v8, as well as the angular-eslint package instead of @angular-eslint/ packages
    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();

    // Root eslint config should be eslint.config.js, not eslintrc
    expect(fixture.readFile('eslint.config.js')).toMatchSnapshot();
    expect(fixture.fileExists('.eslintrc.json')).toBe(false);

    // App project ("app-project")
    expect(fixture.fileExists('projects/app-project/tslint.json')).toBe(false);
    expect(
      fixture.readFile('projects/app-project/eslint.config.js'),
    ).toMatchSnapshot();
    expect(fixture.fileExists('projects/app-project/.eslintrc.json')).toBe(
      false,
    );

    // It should contain the eslintConfig option set to the project level eslint.config.js file
    expect(
      fixture.readJson('angular.json').projects['app-project'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
