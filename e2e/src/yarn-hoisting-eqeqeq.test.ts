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
  runNgAddWithYarn,
  runNgNew,
  runYarnInstall,
} from '../utils/local-registry-process';
import { runLintWithYarn } from '../utils/run-lint';
import { normalizeVersionsOfPackagesWeDoNotControl } from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);

const fixtureDirectory = 'yarn-hoisting-eqeqeq';
let fixture: Fixture;

/**
 * This test verifies that the `eqeqeq` rule with `allowNullOrUndefined: true`
 * works correctly when using Yarn with restricted hoisting (`nmHoistingLimits`).
 *
 * When Yarn's hoisting is restricted, it can cause different copies of
 * `@angular/compiler` to be resolved for the template-parser vs eslint-plugin-template.
 * This breaks `instanceof` checks used in the `isLiteralPrimitive` function,
 * causing the `allowNullOrUndefined` option to not work as expected.
 *
 * Related to: yarn hoisting limits breaking instanceof checks across module copies
 */
describe('yarn-hoisting-eqeqeq', () => {
  vi.setConfig({ testTimeout: LONG_TIMEOUT_MS });

  beforeAll(async () => {
    resetFixtureDirectory(fixtureDirectory);
    process.chdir(FIXTURES_DIR);

    // Create new workspace with yarn as package manager
    await runNgNew(fixtureDirectory, true, 'yarn');

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    fixture = new Fixture(workspaceRoot);

    // Configure Yarn with hoisting limits BEFORE ng add
    // This simulates the problematic configuration
    fixture.writeFile(
      '.yarnrc.yml',
      `nodeLinker: node-modules
nmHoistingLimits: dependencies
`,
    );

    // Reinstall with the new hoisting configuration
    await runYarnInstall();

    // Add angular-eslint
    await runNgAddWithYarn();
  });

  it('should correctly handle eqeqeq allowNullOrUndefined with yarn hoisting limits', async () => {
    // Create a component with a template that uses != null comparison
    const testFilePath = 'src/app/test.component.ts';

    fixture.writeFile(
      testFilePath,
      `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: \`
    <ng-container *ngIf="title != null">title is not null</ng-container>
    <ng-container *ngIf="value != undefined">value is not undefined</ng-container>
    <div *ngIf="name != null">{{ name }}</div>
  \`
})
export class TestComponent {
  title: string | null = 'test';
  value: number | undefined = 42;
  name: string | null = 'John';
}
`,
    );

    // Update eslint config to enable eqeqeq with allowNullOrUndefined
    const eslintConfigPath = 'eslint.config.js';
    const eslintConfig = fixture.readFile(eslintConfigPath);

    // Insert the eqeqeq rule configuration into the existing config
    const updatedEslintConfig = eslintConfig.replace(
      /(\s*)(\.\.\.angular\.configs\.templateRecommended)/,
      `$1$2,
$1{
$1  files: ['**/*.html'],
$1  rules: {
$1    '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
$1  },
$1}`,
    );

    fixture.writeFile(eslintConfigPath, updatedEslintConfig);

    // Run lint and capture output
    const lintOutput = await runLintWithYarn(fixtureDirectory);

    // The lint should pass without errors about eqeqeq
    // If the hoisting issue exists, it would report:
    // "Expected `!==` but received `!=`"
    expect(lintOutput).toMatchSnapshot();
  });

  it('should still report eqeqeq violations for non-null/undefined comparisons', async () => {
    // Create a component with a template that uses == for non-null/undefined comparison
    const testFilePath = 'src/app/bad-equality.component.ts';

    fixture.writeFile(
      testFilePath,
      `
import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-equality',
  standalone: true,
  template: \`
    <div *ngIf="count == 5">count is 5</div>
    <div *ngIf="status == 'active'">status is active</div>
  \`
})
export class BadEqualityComponent {
  count = 5;
  status = 'active';
}
`,
    );

    // Run lint and capture output
    const lintOutput = await runLintWithYarn(fixtureDirectory);

    // Should report eqeqeq violations for the non-null/undefined comparisons
    expect(lintOutput).toMatchSnapshot();
  });
});
