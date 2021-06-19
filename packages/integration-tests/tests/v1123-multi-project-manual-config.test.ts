import path from 'path';
import { runNgAdd, runNpmInstall } from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');
const fixtureDirectory = 'v1123-multi-project-manual-config';

describe(fixtureDirectory, () => {
  // Allow enough time for npm install and ng add to complete
  jest.setTimeout(120000);

  beforeEach(async () => {
    const cwd = process.cwd();
    process.chdir(path.join(FIXTURES_DIR, fixtureDirectory));
    await runNpmInstall();
    await runNgAdd();
    process.chdir(cwd);
  });

  it('it should produce the expected lint output', () => {
    const lintOutput = runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
