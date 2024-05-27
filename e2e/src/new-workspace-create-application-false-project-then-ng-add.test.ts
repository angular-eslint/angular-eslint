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

    // Pin eslint v8 to temporarily preserve existing behavior
    const packageJson = JSON.parse(fixture.readFile('package.json'));
    fixture.writeFile(
      'package.json',
      JSON.stringify(
        {
          ...packageJson,
          devDependencies: {
            ...packageJson.devDependencies,
            // Intentionally random older version of eslint, should end up as 8.57.0 in the final package.json snapshot
            eslint: '8.0.0',
          },
        },
        null,
        2,
      ),
    );

    await runNgGenerate(['app', 'app-project', '--interactive=false']);
    await runNgAdd();
  });

  it('it should pass linting when ng-add is run before adding a project', async () => {
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
      'npm install eslint@8 @typescript-eslint/eslint-plugin@7 @typescript-eslint/parser@7 --force',
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
