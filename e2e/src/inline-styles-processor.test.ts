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

const fixtureDirectory = 'inline-styles-processor';
let fixture: Fixture;

describe('inline-styles-processor', () => {
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

    fixture.runCommand('npm install -D @eslint/css');

    fixture.deleteFileOrDirectory('eslint.config.js');
    fixture.writeFile(
      'eslint.config.mjs',
      `// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import css from '@eslint/css';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineStyles,
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
    processor: angular.processInlineStyles,
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    rules: {
      'css/no-empty-blocks': 'error',
      'css/no-invalid-properties': 'error',
      'css/prefer-logical-properties': 'error',
    },
  },
]);
`,
    );
  });

  it('should lint static inline styles with @eslint/css and skip dynamic ones', async () => {
    fixture.writeFile(
      'src/app/styles-demo.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-styles-demo',
  template: \`
    <div style="margin-left: 0; color: blue"></div>
    <div style="color: {{ color }}"></div>
    <div style="{{ dynamicStyles }}"></div>
    <div [style.color]="color"></div>
  \`,
  styles: [
    'a { margin-left: 0; }',
    \`
      .empty {}
      p { colr: red; }
    \`,
  ],
})
export class StylesDemo {
  color = 'red';
  dynamicStyles = 'color: red';
}
`,
    );
    fixture.writeFile(
      'src/app/styles-demo-external.html',
      `<p style="margin-right: 0"></p>
<p style="width: {{ width }}px"></p>
`,
    );

    const result = (await runLint(fixtureDirectory)) ?? '';

    expect(messagesFor(result, 'src/app/styles-demo.ts')).toEqual([
      "6:17 error Expected logical property 'margin-inline-start' instead of 'margin-left' css/prefer-logical-properties",
      "12:10 error Expected logical property 'margin-inline-start' instead of 'margin-left' css/prefer-logical-properties",
      '14:14 error Unexpected empty block found css/no-empty-blocks',
      "15:11 error Unknown property 'colr' found css/no-invalid-properties",
    ]);
    expect(messagesFor(result, 'src/app/styles-demo-external.html')).toEqual([
      "1:11 error Expected logical property 'margin-inline-end' instead of 'margin-right' css/prefer-logical-properties",
    ]);
  });
});

/**
 * Returns the stylish formatter's messages for a single file, with column padding collapsed
 */
function messagesFor(output: string, file: string): string[] {
  const lines = output.split(/\r?\n/);
  const start = lines.findIndex((line) =>
    line.endsWith(`/${fixtureDirectory}/${file}`),
  );
  if (start === -1) {
    return [];
  }
  const end = lines.findIndex((line, index) => index > start && !line.trim());
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .map((line) => line.trim().replace(/\s{2,}/g, ' '));
}
