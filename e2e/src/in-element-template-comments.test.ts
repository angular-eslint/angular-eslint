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
  runNgNew,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';
import { normalizeVersionsOfPackagesWeDoNotControl } from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);

const fixtureDirectory = 'in-element-template-comments';
let fixture: Fixture;

// Angular v22 allows TypeScript-style comments inside an element's opening
// tag, and as of @angular/compiler v22.0.5 they are surfaced to ESLint as
// comment tokens. This means inline directives such as
// `eslint-disable-next-line` can be used from within an element's opening tag,
// in both external and inline templates, in addition to classic HTML
// `<!-- -->` comments.
describe('in-element-template-comments', () => {
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
  });

  it('should respect eslint-disable directives in in-element comments in external and inline templates', async () => {
    fixture.writeFile(
      'src/inline.component.ts',
      `
import { Component } from '@angular/core';

@Component({
  selector: 'app-inline',
  template: \`
    <input
      // eslint-disable-next-line @angular-eslint/template/banana-in-box
      ([suppressedByLineComment])="value">
    <input ([suppressedByBlockComment])="value" /* eslint-disable-line @angular-eslint/template/banana-in-box */>
    <input ([inlineControlCase])="value">
  \`,
})
export class InlineComponent {}
`,
    );

    fixture.writeFile(
      'src/external.component.ts',
      `
import { Component } from '@angular/core';

@Component({
  selector: 'app-external',
  templateUrl: './external.component.html',
})
export class ExternalComponent {}
`,
    );

    fixture.writeFile(
      'src/external.component.html',
      `<input
  // eslint-disable-next-line @angular-eslint/template/banana-in-box
  ([suppressedByLineComment])="value">
<input ([suppressedByBlockComment])="value" /* eslint-disable-line @angular-eslint/template/banana-in-box */>
<input ([externalControlCase])="value">
`,
    );

    // Only the two control case violations should be reported: the four
    // violations covered by in-element eslint-disable comments must be
    // suppressed, and no unused eslint-disable directives should be reported.
    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toMatchSnapshot();
  });
});
