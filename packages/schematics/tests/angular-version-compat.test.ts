import { describe, expect, it } from 'vitest';
import {
  findAngularVersionMismatches,
  formatAngularVersionMatchMessage,
  formatAngularVersionMismatchMessage,
  hasDetectableAngularVersion,
  parseMajorVersion,
} from '../src/angular-version-compat';

describe('parseMajorVersion', () => {
  it.each([
    ['22.1.0', 22],
    ['^22.1.4', 22],
    ['~21.2.0', 21],
    ['>= 22.0.0 < 23.0.0', 22],
    ['v21.0.0', 21],
    ['10', 10],
  ])('parses %s as %s', (specifier, expected) => {
    expect(parseMajorVersion(specifier)).toBe(expected);
  });

  it.each(['', '*', 'latest', 'workspace:*', 'file:../pkg', undefined])(
    'returns null for %s',
    (specifier) => {
      expect(parseMajorVersion(specifier)).toBeNull();
    },
  );
});

describe('findAngularVersionMismatches', () => {
  it('returns nothing when no Angular packages are declared', () => {
    expect(findAngularVersionMismatches({ devDependencies: {} }, 22)).toEqual(
      [],
    );
  });

  it('returns nothing when declared majors match', () => {
    expect(
      findAngularVersionMismatches(
        {
          dependencies: { '@angular/core': '^22.1.0' },
          devDependencies: { '@angular/cli': '22.1.4' },
        },
        22,
      ),
    ).toEqual([]);
  });

  it('reports mismatched @angular/core and @angular/cli', () => {
    expect(
      findAngularVersionMismatches(
        {
          dependencies: { '@angular/core': '^21.2.0' },
          devDependencies: { '@angular/cli': '21.2.0' },
        },
        22,
      ),
    ).toEqual([
      {
        packageName: '@angular/core',
        specifier: '^21.2.0',
        foundMajor: 21,
      },
      {
        packageName: '@angular/cli',
        specifier: '21.2.0',
        foundMajor: 21,
      },
    ]);
  });

  it('prefers an installed major over the declared range', () => {
    expect(
      findAngularVersionMismatches(
        { dependencies: { '@angular/core': '^21.2.0' } },
        22,
        { '@angular/core': 22 },
      ),
    ).toEqual([]);
  });
});

describe('messages', () => {
  it('formats a mismatch for humans', () => {
    const message = formatAngularVersionMismatchMessage(22, [
      {
        packageName: '@angular/core',
        specifier: '^21.2.0',
        foundMajor: 21,
      },
    ]);
    expect(message).toContain(
      'angular-eslint v22 is intended for Angular v22.',
    );
    expect(message).toContain('@angular/core@^21.2.0 (v21)');
    expect(message).toContain('ANGULAR_VERSION_SUPPORT.md');
  });

  it('formats a match confirmation', () => {
    expect(formatAngularVersionMatchMessage(22)).toBe(
      "angular-eslint v22 matches this workspace's Angular v22.",
    );
  });

  it('detects whether any Angular version is visible', () => {
    expect(hasDetectableAngularVersion({})).toBe(false);
    expect(
      hasDetectableAngularVersion({
        dependencies: { '@angular/core': '^22.0.0' },
      }),
    ).toBe(true);
  });
});
