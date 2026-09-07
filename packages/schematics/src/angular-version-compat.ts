/**
 * Shared helpers for reporting Angular major mismatches without using a
 * package-manager peer on `@angular/cli`.
 */

export const ANGULAR_PACKAGES_TO_CHECK = [
  '@angular/core',
  '@angular/cli',
] as const;

export interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  version?: string;
}

export interface AngularVersionMismatch {
  packageName: string;
  specifier: string;
  foundMajor: number;
}

/**
 * Best-effort major from a semver version or range (`^22.1.0`, `~21.2.0`,
 * `>= 22.0.0 < 23.0.0`, `22.1.0`).
 */
export function parseMajorVersion(
  specifier: string | undefined | null,
): number | null {
  if (!specifier) {
    return null;
  }
  const trimmed = specifier.trim();
  if (
    !trimmed ||
    trimmed === '*' ||
    trimmed === 'latest' ||
    /^(workspace|catalog|file|link|portal|git|http|https):/i.test(trimmed)
  ) {
    return null;
  }
  const match = trimmed.match(/(\d+)/);
  if (!match) {
    return null;
  }
  const major = Number(match[1]);
  // 0.x (including the e2e publish version `0.0.0-e2e`) is not an
  // Angular-aligned major; treat it as undetectable rather than v0.
  if (major === 0) {
    return null;
  }
  return major;
}

export function findDeclaredDependency(
  pkg: PackageJsonLike,
  name: string,
): string | undefined {
  return (
    pkg.dependencies?.[name] ??
    pkg.devDependencies?.[name] ??
    pkg.peerDependencies?.[name]
  );
}

export function findAngularVersionMismatches(
  workspacePackageJson: PackageJsonLike,
  expectedMajor: number,
  installedMajors?: Partial<Record<string, number | null>>,
): AngularVersionMismatch[] {
  const mismatches: AngularVersionMismatch[] = [];
  for (const name of ANGULAR_PACKAGES_TO_CHECK) {
    const declared = findDeclaredDependency(workspacePackageJson, name);
    const installedMajor = installedMajors?.[name];
    const major = installedMajor ?? parseMajorVersion(declared);
    if (major == null || major === expectedMajor) {
      continue;
    }
    mismatches.push({
      packageName: name,
      specifier: declared ?? `v${major}`,
      foundMajor: major,
    });
  }
  return mismatches;
}

export function hasDetectableAngularVersion(
  workspacePackageJson: PackageJsonLike,
  installedMajors?: Partial<Record<string, number | null>>,
): boolean {
  return ANGULAR_PACKAGES_TO_CHECK.some((name) => {
    const installed = installedMajors?.[name];
    if (installed != null) {
      return true;
    }
    return (
      parseMajorVersion(findDeclaredDependency(workspacePackageJson, name)) !==
      null
    );
  });
}

const ANGULAR_VERSION_SUPPORT_DOCS_URL =
  'https://github.com/angular-eslint/angular-eslint/blob/main/docs/ANGULAR_VERSION_SUPPORT.md';

function formatAngularVersionMismatchDetails(
  expectedMajor: number,
  mismatches: AngularVersionMismatch[],
): string {
  const details = mismatches
    .map(
      (mismatch) =>
        `  - ${mismatch.packageName}@${mismatch.specifier} (v${mismatch.foundMajor})`,
    )
    .join('\n');
  return `
angular-eslint v${expectedMajor} is intended for Angular v${expectedMajor}.
This workspace is using a different Angular major:
${details}
`.trim();
}

export function formatAngularVersionMismatchMessage(
  expectedMajor: number,
  mismatches: AngularVersionMismatch[],
): string {
  return `
${formatAngularVersionMismatchDetails(expectedMajor, mismatches)}

See ${ANGULAR_VERSION_SUPPORT_DOCS_URL}
`.trim();
}

export function formatAngularVersionMatchMessage(
  expectedMajor: number,
): string {
  return `angular-eslint v${expectedMajor} matches this workspace's Angular v${expectedMajor}.`;
}

/**
 * The Angular major that the user should install angular-eslint for, based on
 * the mismatches found. `@angular/core` is the source of truth for the
 * workspace's Angular version, so prefer it over `@angular/cli`.
 */
export function getRecommendedAngularMajor(
  mismatches: AngularVersionMismatch[],
): number | null {
  const core = mismatches.find(
    (mismatch) => mismatch.packageName === '@angular/core',
  );
  return core?.foundMajor ?? mismatches[0]?.foundMajor ?? null;
}

/**
 * Error shown by `ng add` when the workspace Angular major does not match the
 * angular-eslint major being added. Unlike the warning used by `ng lint`, this
 * stops the schematic and tells the user exactly what to rerun.
 */
export function formatAngularVersionMismatchError(
  expectedMajor: number,
  mismatches: AngularVersionMismatch[],
): string {
  const major =
    getRecommendedAngularMajor(mismatches) ?? '<your Angular major>';
  return `
${formatAngularVersionMismatchDetails(expectedMajor, mismatches)}

\`ng add\` installs the latest angular-eslint by default, which does not match this workspace.
Rerun the command with the Angular major of this workspace:

  ng add angular-eslint@${major}

If you added @angular-eslint/schematics directly, rerun \`ng add @angular-eslint/schematics@${major}\` instead.
The mismatched package that \`ng add\` just installed will be replaced when you rerun it.

See ${ANGULAR_VERSION_SUPPORT_DOCS_URL}
`.trim();
}
