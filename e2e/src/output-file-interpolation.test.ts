import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  FIXTURES_DIR,
  Fixture,
  resetFixtureDirectory,
} from '../utils/fixtures';
import {
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgGenerate,
  runNgNew,
} from '../utils/local-registry-process';
import {
  normalizeFixturesDir,
  normalizeVersionsOfPackagesWeDoNotControl,
} from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);
expect.addSnapshotSerializer(normalizeFixturesDir);

const fixtureDirectory = 'output-file-interpolation';
let fixture: Fixture;

describe('output-file-interpolation', () => {
  vi.setConfig({ testTimeout: LONG_TIMEOUT_MS });

  beforeAll(async () => {
    resetFixtureDirectory(fixtureDirectory);
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
    await runNgGenerate(['app', 'app-one', '--interactive=false']);
    await runNgGenerate(['app', 'app-two', '--interactive=false']);
    await runNgGenerate(['lib', 'lib-one', '--interactive=false']);

    // Configure app-one with outputFile using {projectName} placeholder
    const angularJson = fixture.readJson('angular.json');
    angularJson.projects['app-one'].architect.lint.options.outputFile =
      'lint-reports/{projectName}-report.json';
    angularJson.projects['app-one'].architect.lint.options.format = 'json';
    fixture.writeJson('angular.json', angularJson);

    // Configure lib-one with outputFile using both placeholders
    angularJson.projects['lib-one'].architect.lint.options.outputFile =
      '{projectRoot}/reports/{projectName}-results.json';
    angularJson.projects['lib-one'].architect.lint.options.format = 'json';
    fixture.writeJson('angular.json', angularJson);
  });

  it('should write lint reports to interpolated paths for projects with outputFile configuration with known placeholders', async () => {
    expect.assertions(2);

    // Run lint for app-one
    try {
      fixture.runCommand('npx ng lint app-one');
    } catch {
      // Lint may fail, but we're interested in the output files
    }

    // Verify report was written to the interpolated path and snapshot the contents
    const appOneReport = fixture.readJson('lint-reports/app-one-report.json');
    expect(appOneReport).toMatchSnapshot();

    // Run lint for lib-one
    try {
      fixture.runCommand('npx ng lint lib-one');
    } catch {
      // Lint may fail, but we're interested in the output files
    }

    // Verify report was written to the interpolated path using projectRoot and snapshot the contents
    const libOneReport = fixture.readJson(
      'projects/lib-one/reports/lib-one-results.json',
    );
    expect(libOneReport).toMatchSnapshot();
  });

  it('should support dynamic override of outputFile with placeholder interpolation', async () => {
    expect.assertions(2);

    // Run lint for app-two with dynamic outputFile override
    try {
      fixture.runCommand(
        'npx ng lint app-two --output-file="dynamic-reports/{projectName}/{projectRoot}/lint.json" --format=json',
      );
    } catch {
      // Lint may fail, but we're interested in the output files
    }

    // Verify report was written to the dynamically interpolated path and snapshot the contents
    const appTwoReportPath =
      'dynamic-reports/app-two/projects/app-two/lint.json';
    expect(fixture.fileExists(appTwoReportPath)).toBe(true);

    const appTwoReport = fixture.readJson(appTwoReportPath);
    expect(appTwoReport).toMatchSnapshot();
  });

  it('should interpolate placeholders when running ng lint without project name (all projects)', async () => {
    expect.assertions(5);

    // Clean up any previous reports
    if (fixture.directoryExists('all-projects-reports')) {
      fixture.deleteFileOrDirectory('all-projects-reports');
    }

    // Run ng lint without a project name - this lints ALL projects
    try {
      fixture.runCommand(
        'npx ng lint --output-file="all-projects-reports/{projectName}-{projectRoot}.json" --format=json',
      );
    } catch {
      // Lint may fail, but we're interested in the output files
    }

    // Verify each project has its own report file with interpolated paths
    // The default project name should get its own file
    const defaultProjectReport =
      'all-projects-reports/output-file-interpolation-.json';
    expect(fixture.fileExists(defaultProjectReport)).toBe(true);

    // app-one should have its own file
    const appOneReportPath =
      'all-projects-reports/app-one-projects/app-one.json';
    expect(fixture.fileExists(appOneReportPath)).toBe(true);

    // app-two should have its own file
    const appTwoReportPath =
      'all-projects-reports/app-two-projects/app-two.json';
    expect(fixture.fileExists(appTwoReportPath)).toBe(true);

    // lib-one should have its own file
    const libOneReportPath =
      'all-projects-reports/lib-one-projects/lib-one.json';
    expect(fixture.fileExists(libOneReportPath)).toBe(true);

    // Snapshot all reports to ensure they contain the correct lint results
    const defaultReport = fixture.readJson(defaultProjectReport);
    const appOneReport = fixture.readJson(appOneReportPath);
    const appTwoReport = fixture.readJson(appTwoReportPath);
    const libOneReport = fixture.readJson(libOneReportPath);

    expect({
      'output-file-interpolation': defaultReport,
      'app-one': appOneReport,
      'app-two': appTwoReport,
      'lib-one': libOneReport,
    }).toMatchSnapshot();
  });
});
