import fs from 'node:fs';
import path from 'node:path';
import { setWorkspaceRoot, workspaceRoot } from 'nx/src/utils/workspace-root';
import {
  FIXTURES_DIR,
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgNew,
} from '../utils/local-registry-process';
import { runLintFix } from '../utils/run-lint';

const fixtureDirectory = 'inline-template-fixer';

const inlineTemplateFileContent = `
import { Component } from '@angular/core';

@Component({
  template: \`
    <div autofocus></div> <!-- no autofocus -->
    <marquee></marquee>{{ '' }} <!-- no-distracting-elements -->
    <div scope></div> <!-- table-scope -->
  \`
})
export class TestComponent {}
`;

describe(fixtureDirectory, () => {
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

    await runNgAdd();
  });

  it('should generate the expected inline template fixer result', async () => {
    const testFilePath = path.join(workspaceRoot, 'src', 'test.component.ts');
    fs.writeFileSync(testFilePath, inlineTemplateFileContent);
    await runLintFix(fixtureDirectory);
    const fileContent = fs.readFileSync(testFilePath, 'utf8');
    expect(fileContent).toMatchSnapshot();
  });
});
