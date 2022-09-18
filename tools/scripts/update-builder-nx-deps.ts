import { writeFileSync } from 'fs';
import { join } from 'path';
import { format, resolveConfig } from 'prettier';

/**
 * Used within the nx-migrate.yml workflow to help automate renovate PRs
 */
(async function updateBuilderNxDeps() {
  try {
    if (!process.env.NX_VERSION || !process.env.NX_VERSION.length) {
      throw new Error('NX_VERSION environment variable is not set');
    }
    const packageJsonPath = join(
      __dirname,
      '../../packages/builder/package.json',
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(packageJsonPath);
    const finalVersion = `^${process.env.NX_VERSION}`;
    packageJson.dependencies['@nrwl/devkit'] = finalVersion;
    packageJson.dependencies['nx'] = finalVersion;

    writeFileSync(
      packageJsonPath,
      format(JSON.stringify(packageJson, null, 2), {
        ...(await resolveConfig(packageJsonPath)),
        parser: 'json',
      }),
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
