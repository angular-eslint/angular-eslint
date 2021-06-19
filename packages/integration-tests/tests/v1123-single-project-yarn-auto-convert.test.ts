/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import {
  runConvertTSLintToESLint,
  runNgAdd,
  runYarnInstall,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');
const fixtureDirectory = 'v1123-single-project-yarn-auto-convert';

describe(fixtureDirectory, () => {
  // Allow enough time for yarn install, ng add and convert-tslint-to-eslint schematic to complete
  jest.setTimeout(120000);

  beforeEach(async () => {
    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));
    await runYarnInstall();
    await runNgAdd();
    await runConvertTSLintToESLint([
      '--no-interactive',
      '--project',
      'v1123-single-project-yarn-auto-convert',
    ]);
  });

  it('it should pass linting after converting the out of the box Angular CLI setup (with a custom prefix set)', () => {
    expect(
      require('../fixtures/v1123-single-project-yarn-auto-convert/.eslintrc.json'),
    ).toMatchSnapshot();

    expect(
      require('../fixtures/v1123-single-project-yarn-auto-convert/angular.json')
        .projects['v1123-single-project-yarn-auto-convert'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
