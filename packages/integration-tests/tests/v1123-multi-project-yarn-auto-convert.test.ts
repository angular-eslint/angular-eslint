/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import {
  runConvertTSLintToESLint,
  runNgAdd,
  runYarnInstall,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');
const fixtureDirectory = 'v1123-multi-project-yarn-auto-convert';

describe(fixtureDirectory, () => {
  // Allow enough time for yarn install, ng add and multiple convert-tslint-to-eslint schematics to complete
  jest.setTimeout(180000);

  beforeEach(async () => {
    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));
    await runYarnInstall();
    await runNgAdd();

    // Deliberately don't convert the root project first, so we can ensure this is also supported
    await runConvertTSLintToESLint([
      '--no-interactive',
      '--project',
      'another-app',
    ]);
    // root project
    await runConvertTSLintToESLint([
      '--no-interactive',
      '--project',
      'v1123-multi-project-yarn-auto-convert',
    ]);
    await runConvertTSLintToESLint([
      '--no-interactive',
      '--project',
      'another-lib',
    ]);
  });

  it('it should pass linting after converting the out of the box Angular CLI setup (with an additional project called "another-app" with a custom prefix set)', () => {
    // Root project
    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/angular.json')
        .projects['v1123-multi-project-yarn-auto-convert'].architect.lint,
    ).toMatchSnapshot();

    // Additional project ("another-app")
    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/projects/another-app/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/angular.json')
        .projects['another-app'].architect.lint,
    ).toMatchSnapshot();

    // Additional library project ("another-lib")
    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/projects/another-lib/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-multi-project-yarn-auto-convert/angular.json')
        .projects['another-lib'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
