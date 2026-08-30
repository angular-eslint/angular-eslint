import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  findAngularVersionMismatches,
  formatAngularVersionMismatchMessage,
  parseMajorVersion,
} from './angular-version-compat';
import { reportAngularVersionCompatibility } from './report-angular-version-compat';

describe('parseMajorVersion', () => {
  it('parses caret ranges and exact versions', () => {
    expect(parseMajorVersion('^22.1.0')).toBe(22);
    expect(parseMajorVersion('21.2.0')).toBe(21);
    expect(parseMajorVersion('22.0.0-e2e')).toBe(22);
  });

  it('treats 0.x placeholders such as 0.0.0-e2e as undetectable', () => {
    expect(parseMajorVersion('0.0.0-e2e')).toBeNull();
    expect(parseMajorVersion('0.0.0')).toBeNull();
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
