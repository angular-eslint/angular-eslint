import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANGULAR_PACKAGES_TO_CHECK,
  findAngularVersionMismatches,
  formatAngularVersionMismatchMessage,
  parseMajorVersion,
  type PackageJsonLike,
} from './angular-version-compat';

function readWorkspacePackageJson(workspaceRoot: string): PackageJsonLike {
  try {
    return JSON.parse(
      readFileSync(join(workspaceRoot, 'package.json'), 'utf8'),
    ) as PackageJsonLike;
  } catch {
    return {};
  }
}

/**
 * Read an installed package version from this workspace only (no walk-up
 * into parent node_modules, which would lie in monorepo tests and nested
 * workspaces).
 */
function readInstalledMajor(
  workspaceRoot: string,
  packageName: string,
): number | null {
  try {
    const pkgJsonPath = join(
      workspaceRoot,
      'node_modules',
      ...packageName.split('/'),
      'package.json',
    );
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
      version?: string;
    };
    return parseMajorVersion(pkg.version);
  } catch {
    return null;
  }
}

/**
 * Warn when the workspace Angular major does not match this builder's major.
 * Does not fail the lint; package managers should not be the compatibility UI.
 */
export function reportAngularVersionCompatibility(
  workspaceRoot: string,
  expectedMajor: number,
  warn: (message: string) => void,
): void {
  const workspacePackageJson = readWorkspacePackageJson(workspaceRoot);
  const installedMajors: Partial<Record<string, number | null>> = {};
  for (const name of ANGULAR_PACKAGES_TO_CHECK) {
    installedMajors[name] = readInstalledMajor(workspaceRoot, name);
  }
  const mismatches = findAngularVersionMismatches(
    workspacePackageJson,
    expectedMajor,
    installedMajors,
  );
  if (mismatches.length === 0) {
    return;
  }
  warn(formatAngularVersionMismatchMessage(expectedMajor, mismatches));
}
