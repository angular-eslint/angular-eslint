import { execSync } from 'node:child_process';
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
  'new-workspace-create-application-false-ng-add-then-project';
let fixture: Fixture;

describe('new-workspace-create-application-false-ng-add-then-project', () => {
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

    await runNgAdd();
    await runNgGenerate(['app', 'app-project', '--interactive=false']);
  });

  it('it should pass linting when adding a project before running ng-add', async () => {
    // TSLint configs and dependencies should not be present
    expect(fixture.fileExists('tslint.json')).toBe(false);
    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();

    // Root eslint config
    expect(fixture.readFile('.eslintrc.json')).toMatchSnapshot();

    // App project ("app-project")
    expect(fixture.fileExists('projects/app-project/tslint.json')).toBe(false);
    expect(
      fixture.readFile('projects/app-project/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      fixture.readJson('angular.json').projects['app-project'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });

  it('it should pass linting when adding a project before running ng-add -> with eslint v8 and typescript-eslint v7', async () => {
    // Downgrade eslint to v8 and typescript-eslint to v7
    execSync(
      'npm install eslint@8 @typescript-eslint/{eslint-plugin,parser}@7 --force',
      {
        stdio: 'inherit',
        cwd: fixture.root,
      },
    );

    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
