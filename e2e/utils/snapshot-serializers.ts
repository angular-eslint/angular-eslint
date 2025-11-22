import type { SnapshotSerializer } from 'vitest';
import { FIXTURES_DIR, normalizeFixturesDirForSnapshot } from './fixtures';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeVersionOfPackage(str: string, pkg: string) {
  const regex = new RegExp(
    `("${escapeRegExp(pkg)}": "[~|^]\\d+\\.)(\\d+\\.\\d+)"`,
  );
  return str.replace(regex, '$1X.X"');
}

const dependenciesToNormalize = [
  '@angular-devkit/build-angular',
  '@angular/build',
  '@angular/cli',
  '@angular/compiler-cli',
  'ng-packagr',
  'typescript',
];

/**
 * Normalize dependencies controlled by the Angular CLI so that only the major version is explicitly
 * checked so that we can massively cut down on snapshot update noise across PRs.
 */
export const normalizeVersionsOfPackagesWeDoNotControl: SnapshotSerializer = {
  serialize(str) {
    for (const pkg of dependenciesToNormalize) {
      str = normalizeVersionOfPackage(str, pkg);
    }
    return str;
  },
  test(val) {
    // Only run if we think it's package.json contents
    return (
      val != null &&
      typeof val === 'string' &&
      dependenciesToNormalize.some((pkg) => val.includes(`"${pkg}"`))
    );
  },
};

export const normalizeFixturesDir: SnapshotSerializer = {
  serialize(str, config, indentation, depth, refs, printer) {
    // Use the default string serializer to get the quoted version
    const normalizedStr = normalizeFixturesDirForSnapshot(str);
    // Let Vitest handle the quoting by calling the default printer
    return printer(normalizedStr, config, indentation, depth, refs);
  },
  test(val) {
    return val != null && typeof val === 'string' && val.includes(FIXTURES_DIR);
  },
};
