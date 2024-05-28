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
  'eslint-8--new-workspace-create-application-false-ng-add-then-project';
let fixture: Fixture;

describe('eslint-8--new-workspace-create-application-false-ng-add-then-project', () => {
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

    // Pin eslint v8 before running ng-add
    const packageJson = JSON.parse(fixture.readFile('package.json'));
    fixture.writeFile(
      'package.json',
      JSON.stringify(
        {
          ...packageJson,
          devDependencies: {
            ...packageJson.devDependencies,
            // Intentionally random older version of eslint, should end up as 8.57.0 in the final package.json snapshot
            eslint: '8',
          },
        },
        null,
        2,
      ),
    );

    await runNgAdd();
    await runNgGenerate(['app', 'app-project', '--interactive=false']);
  });

  it('should pass linting when running ng-add before creating any projects', async () => {
    // TSLint configs and dependencies should not be present
    expect(fixture.fileExists('tslint.json')).toBe(false);

    // It should contain eslint v8.57.0 and @typescript-eslint/ v7 packages, as well as the latest @angular-eslint/ packages
    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();

    // Root eslint config should be eslintrc, not eslint.config.js
    expect(fixture.readFile('.eslintrc.json')).toMatchSnapshot();
    expect(fixture.fileExists('eslint.config.js')).toBe(false);

    // App project ("app-project")
    expect(fixture.fileExists('projects/app-project/tslint.json')).toBe(false);
    expect(
      fixture.readFile('projects/app-project/.eslintrc.json'),
    ).toMatchSnapshot();
    expect(fixture.fileExists('projects/app-project/eslint.config.js')).toBe(
      false,
    );

    // It should not contain the eslintConfig option, it is not needed for eslintrc files
    expect(
      fixture.readJson('angular.json').projects['app-project'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
