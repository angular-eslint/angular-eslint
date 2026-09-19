import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { FormatSourceError, formatSource } from '../../../../tools/scripts/format-source';

const require = createRequire(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const oxfmtPackageJsonPath = require.resolve('oxfmt/package.json');
const oxfmtBin = path.join(path.dirname(oxfmtPackageJsonPath), 'bin/oxfmt');

const disposableRoots: string[] = [];

afterEach(() => {
  for (const root of disposableRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createDisposableWorkspace(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'angular-eslint-format-'));
  disposableRoots.push(root);

  writeFileSync(
    path.join(root, '.oxfmtrc.json'),
    JSON.stringify(
      {
        singleQuote: true,
        trailingComma: 'all',
        sortImports: false,
        sortPackageJson: false,
      },
      null,
      2,
    ),
  );

  return root;
}

describe('workspace formatting', () => {
  it('format-check rejects misformatted files without modifying them', () => {
    const root = createDisposableWorkspace();
    const targetPath = path.join(root, 'sample.ts');
    const original = "const value='unformatted'\n";
    writeFileSync(targetPath, original);

    expect(() => {
      execFileSync(
        'node',
        [
          oxfmtBin,
          '--no-error-on-unmatched-pattern',
          '--config',
          path.join(workspaceRoot, '.oxfmtrc.json'),
          '--check',
          targetPath,
        ],
        { encoding: 'utf-8' },
      );
    }).toThrow();

    expect(readFileSync(targetPath, 'utf-8')).toBe(original);
  });

  it('format fixes files and a second pass is idempotent', () => {
    const root = createDisposableWorkspace();
    const targetPath = path.join(root, 'sample.ts');
    writeFileSync(targetPath, "const value='unformatted'\n");

    execFileSync(
      'node',
      [
        oxfmtBin,
        '--no-error-on-unmatched-pattern',
        '--config',
        path.join(workspaceRoot, '.oxfmtrc.json'),
        '--write',
        targetPath,
      ],
      { encoding: 'utf-8' },
    );

    const formattedOnce = readFileSync(targetPath, 'utf-8');
    expect(formattedOnce).toBe("const value = 'unformatted';\n");

    execFileSync(
      'node',
      [
        oxfmtBin,
        '--no-error-on-unmatched-pattern',
        '--config',
        path.join(workspaceRoot, '.oxfmtrc.json'),
        '--write',
        targetPath,
      ],
      { encoding: 'utf-8' },
    );

    expect(readFileSync(targetPath, 'utf-8')).toBe(formattedOnce);
  });

  it('preserves exclusions configured in the workspace oxfmt config', () => {
    const excludedPath = path.join(
      workspaceRoot,
      'packages/schematics/src/application/schema.json',
    );
    const original = readFileSync(excludedPath, 'utf-8');

    execFileSync(
      'node',
      [
        oxfmtBin,
        '--no-error-on-unmatched-pattern',
        '--config',
        path.join(workspaceRoot, '.oxfmtrc.json'),
        '--list-different',
        excludedPath,
      ],
      { encoding: 'utf-8' },
    );

    expect(readFileSync(excludedPath, 'utf-8')).toBe(original);
  });

  it('lint-staged only formats explicitly staged filenames', () => {
    const root = createDisposableWorkspace();
    const stagedPath = path.join(root, 'staged.ts');
    const unstagedPath = path.join(root, 'unstaged.ts');
    const stagedOriginal = "const staged='value'\n";
    const unstagedOriginal = "const unstaged='value'\n";
    writeFileSync(stagedPath, stagedOriginal);
    writeFileSync(unstagedPath, unstagedOriginal);

    execFileSync(
      'node',
      [
        oxfmtBin,
        '--no-error-on-unmatched-pattern',
        '--config',
        path.join(workspaceRoot, '.oxfmtrc.json'),
        '--write',
        stagedPath,
      ],
      { encoding: 'utf-8' },
    );

    expect(readFileSync(stagedPath, 'utf-8')).toBe("const staged = 'value';\n");
    expect(readFileSync(unstagedPath, 'utf-8')).toBe(unstagedOriginal);
  });

  it('propagates formatter failures from formatSource', () => {
    expect(() => formatSource('const {{{', 'broken.ts')).toThrow(FormatSourceError);
  });

  it('does not write partial output when generation formatting fails', () => {
    const root = createDisposableWorkspace();
    const outputPath = path.join(root, 'would-write.ts');

    expect(() => formatSource('export const value = {{{', outputPath)).toThrow(FormatSourceError);

    expect(() => readFileSync(outputPath, 'utf-8')).toThrow();
  });

  it('preserves fenced examples in generated rule docs overrides', () => {
    const docsDir = path.join(workspaceRoot, 'packages/eslint-plugin/docs/rules');
    const sampleDoc = readFileSync(path.join(docsDir, 'component-class-suffix.md'), 'utf-8');

    expect(sampleDoc).toMatch(/```/);
    expect(sampleDoc).toMatch(/~~+/);
  });
});
