import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import { FIXTURES_DIR, Fixture } from '../utils/fixtures';
import {
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgNew,
} from '../utils/local-registry-process';
import { runLintFix } from '../utils/run-lint';

const fixtureDirectory = 'inline-template-fixer';
let fixture: Fixture;

describe('inline-template-fixer', () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeEach(async () => {
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
  });

  it('should generate the expected inline template fixer result', async () => {
    const testFilePath = 'src/test.component.ts';

    fixture.writeFile(
      testFilePath,
      `
import { Component } from '@angular/core';

@Component({
  template: \`
    <div autofocus></div> <!-- no autofocus -->
    <marquee></marquee>{{ '' }} <!-- no-distracting-elements -->
    <div scope></div> <!-- table-scope -->
  \`
})
export class TestComponent {}
`,
    );

    await runLintFix(fixtureDirectory);

    expect(fixture.readFile(testFilePath)).toMatchSnapshot();

    // It should contain eslint v9 and typescript-eslint v8, as well as the angular-eslint package instead of @angular-eslint/ packages
    expect(
      JSON.stringify(fixture.readJson('package.json').devDependencies, null, 2),
    ).toMatchSnapshot();
  });
});
