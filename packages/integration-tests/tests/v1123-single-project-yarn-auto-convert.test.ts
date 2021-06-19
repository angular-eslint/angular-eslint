/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import {
  FIXTURES_DIR,
  LONG_TIMEOUT_MS,
  runConvertTSLintToESLint,
  runNgAdd,
  runYarnInstall,
} from '../utils/local-registry-process';
import { requireUncached } from '../utils/require-uncached';
import { runLint } from '../utils/run-lint';

const fixtureDirectory = 'v1123-single-project-yarn-auto-convert';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

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

  it('it should pass linting after converting the out of the box Angular CLI setup (with a custom prefix set)', async () => {
    expect(
      requireUncached(
        '../fixtures/v1123-single-project-yarn-auto-convert/.eslintrc.json',
      ),
    ).toMatchSnapshot();

    expect(
      requireUncached(
        '../fixtures/v1123-single-project-yarn-auto-convert/angular.json',
      ).projects['v1123-single-project-yarn-auto-convert'].architect.lint,
    ).toMatchSnapshot();

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
