import path from 'path';
import {
  FIXTURES_DIR,
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNpmInstall,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';

const fixtureDirectory = 'v1123-multi-project-manual-config';

describe(fixtureDirectory, () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
    const cwd = process.cwd();
    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));
    await runNpmInstall();
    await runNgAdd();
    process.chdir(cwd);
  });

  it('it should produce the expected lint output', async () => {
    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
