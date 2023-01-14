function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeVersionOfPackage(str: string, pkg: string) {
  const regex = new RegExp(
    `("${escapeRegExp(pkg)}": "[~|^]\\d\\d?\\.)(\\d.\\d)"`,
  );
  return str.replace(regex, '$1X.X"');
}

const dependenciesToNormalize = [
  '@angular-devkit/build-angular',
  '@angular/cli',
  '@angular/compiler-cli',
  'ng-packagr',
  'typescript',
];

/**
 * Normalize dependencies controlled by the Angular CLI so that only the major version is explicitly
 * checked so that we can massively cut down on snapshot update noise across PRs.
 */
export const normalizeVersionsOfPackagesWeDoNotControl = {
  serialize(str: string) {
    for (const pkg of dependenciesToNormalize) {
      str = normalizeVersionOfPackage(str, pkg);
    }
    return str;
  },
  test(val: string) {
    // Only run if we think it's package.json contents
    return (
      val != null &&
      typeof val === 'string' &&
      dependenciesToNormalize.some((pkg) => val.includes(`"${pkg}"`))
    );
  },
};
