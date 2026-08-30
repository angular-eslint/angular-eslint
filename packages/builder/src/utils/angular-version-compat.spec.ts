import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  findAngularVersionMismatches,
  formatAngularVersionMatchMessage,
  formatAngularVersionMismatchMessage,
  hasDetectableAngularVersion,
  parseMajorVersion,
} from './angular-version-compat';
import { reportAngularVersionCompatibility } from './report-angular-version-compat';

describe('parseMajorVersion', () => {
  it.each([
    ['22.1.0', 22],
    ['^22.1.4', 22],
    ['~21.2.0', 21],
    ['>= 22.0.0 < 23.0.0', 22],
    ['v21.0.0', 21],
    ['22.0.0-e2e', 22],
  ])('parses %s as %s', (specifier, expected) => {
    expect(parseMajorVersion(specifier)).toBe(expected);
  });

  it.each([
    '',
    '*',
    'latest',
    'workspace:*',
    'catalog:other',
    'file:../pkg',
    'not-a-version',
    '0.0.0-e2e',
    '0.0.0',
    undefined,
  ])('returns null for %s', (specifier) => {
    expect(parseMajorVersion(specifier)).toBeNull();
  });
});

describe('findAngularVersionMismatches', () => {
  it('ignores workspaces with no Angular packages', () => {
    expect(findAngularVersionMismatches({}, 22)).toEqual([]);
  });

  it('flags a declared Angular 21 workspace', () => {
    expect(
      findAngularVersionMismatches(
        { dependencies: { '@angular/core': '~21.2.0' } },
        22,
      ),
    ).toEqual([
      {
        packageName: '@angular/core',
        specifier: '~21.2.0',
        foundMajor: 21,
      },
    ]);
  });

  it('reads Angular packages from peerDependencies', () => {
    expect(
      findAngularVersionMismatches(
        { peerDependencies: { '@angular/core': '^21.2.0' } },
        22,
      ),
    ).toEqual([
      {
        packageName: '@angular/core',
        specifier: '^21.2.0',
        foundMajor: 21,
      },
    ]);
  });

  it('uses an installed major when the specifier is not declared', () => {
    expect(
      findAngularVersionMismatches({}, 22, { '@angular/cli': 21 }),
    ).toEqual([
      {
        packageName: '@angular/cli',
        specifier: 'v21',
        foundMajor: 21,
      },
    ]);
  });
});

describe('messages', () => {
  it('formats a match confirmation', () => {
    expect(formatAngularVersionMatchMessage(22)).toBe(
      "angular-eslint v22 matches this workspace's Angular v22.",
    );
  });

  it('detects Angular from an installed major even without a declaration', () => {
    expect(hasDetectableAngularVersion({})).toBe(false);
    expect(hasDetectableAngularVersion({}, { '@angular/core': 22 })).toBe(true);
  });
});

describe('reportAngularVersionCompatibility', () => {
  it('does not warn when package.json has no Angular packages', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ae-compat-'));
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({}));
    const warn = vi.fn();
    reportAngularVersionCompatibility(workspace, 22, warn);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns from the workspace package.json when majors differ', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ae-compat-'));
    writeFileSync(
      join(workspace, 'package.json'),
      JSON.stringify({
        dependencies: { '@angular/core': '^21.2.0' },
      }),
    );
    const warn = vi.fn();
    reportAngularVersionCompatibility(workspace, 22, warn);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toBe(
      formatAngularVersionMismatchMessage(22, [
        {
          packageName: '@angular/core',
          specifier: '^21.2.0',
          foundMajor: 21,
        },
      ]),
    );
  });

  it('prefers the installed package major under node_modules', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ae-compat-'));
    writeFileSync(
      join(workspace, 'package.json'),
      JSON.stringify({
        dependencies: { '@angular/core': '^21.2.0' },
      }),
    );
    const coreDir = join(workspace, 'node_modules', '@angular', 'core');
    mkdirSync(coreDir, { recursive: true });
    writeFileSync(
      join(coreDir, 'package.json'),
      JSON.stringify({ name: '@angular/core', version: '22.1.3' }),
    );
    const warn = vi.fn();
    reportAngularVersionCompatibility(workspace, 22, warn);
    expect(warn).not.toHaveBeenCalled();
  });
});
