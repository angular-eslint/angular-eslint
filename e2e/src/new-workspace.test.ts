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

const fixtureDirectory = 'new-workspace';
let fixture: Fixture;

describe('new-workspace', () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeAll(async () => {
    process.chdir(FIXTURES_DIR);
    await runNgNew(fixtureDirectory);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    fixture = new Fixture(workspaceRoot);

    await runNgAdd();
    await runNgGenerate(['app', 'another-app', '--interactive=false']);
    await runNgGenerate(['lib', 'another-lib', '--interactive=false']);
  });

  it('should pass linting after creating a new workspace from scratch using @angular-eslint', async () => {
    // TSLint configs and dependencies should not be present
    expect(fixture.fileExists('tslint.json')).toBe(false);
    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();

    // Root eslint config should be eslint.config.js, not eslintrc
    expect(fixture.readFile('eslint.config.js')).toMatchSnapshot();
    expect(fixture.fileExists('.eslintrc.json')).toBe(false);

    expect(
      fixture.readJson('angular.json').projects['new-workspace'].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(fixture.fileExists('projects/another-app/tslint.json')).toBe(false);
    expect(
      fixture.readFile('projects/another-app/eslint.config.js'),
    ).toMatchSnapshot();
    expect(fixture.fileExists('projects/another-app/.eslintrc.json')).toBe(
      false,
    );

    // It should contain the eslintConfig option set to the project level eslint.config.js file
    expect(
      fixture.readJson('angular.json').projects['another-app'].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(fixture.fileExists('projects/another-lib/tslint.json')).toBe(false);
    expect(
      fixture.readFile('projects/another-lib/eslint.config.js'),
    ).toMatchSnapshot();
    expect(fixture.fileExists('projects/another-lib/.eslintrc.json')).toBe(
      false,
    );

    // It should contain the eslintConfig option set to the project level eslint.config.js file
    expect(
      fixture.readJson('angular.json').projects['another-lib'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
