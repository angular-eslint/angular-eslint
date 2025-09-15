import * as execa from 'execa';
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release';
import yargs from 'yargs';

(async () => {
  try {
    const options = await yargs(process.argv)
      .version(false)
      .option('version', {
        description:
          'Explicit version specifier to use, if overriding conventional commits',
        type: 'string',
      })
      .option('dryRun', {
        alias: 'd',
        description:
          'Whether or not to perform a dry-run of the release process, defaults to true',
        type: 'boolean',
        default: true,
      })
      .option('forceReleaseWithoutChanges', {
        default: false,
        description:
          'Whether to do a release regardless of if there have been changes',
        type: 'boolean',
      })
      .option('verbose', {
        default: false,
        description:
          'Whether or not to enable verbose logging, defaults to false',
        type: 'boolean',
      })
      .option('firstRelease', {
        default: false,
        description:
          'Whether or not one of more of the packages are being released for the first time',
        type: 'boolean',
      })
      .parseAsync();

    // Ensure the packages are built for publishing
    execa.sync('pnpm', ['build'], {
      stdio: 'inherit',
    });

    const { workspaceVersion, projectsVersionData } = await releaseVersion({
      specifier: options.version,
      // stage package.json updates to be committed later by the changelog command
      stageChanges: true,
      dryRun: options.dryRun,
      verbose: options.verbose,
      firstRelease: options.firstRelease,
    });

    // This will create a release on GitHub, which will act as a trigger for the publish.yml workflow
    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      interactive: process.env.CI ? undefined : 'workspace',
      dryRun: options.dryRun,
      verbose: options.verbose,
      firstRelease: options.firstRelease,
    });

    // An explicit null value here means that no changes were detected across any package
    if (!options.forceReleaseWithoutChanges && workspaceVersion === null) {
      console.log(
        '⏭️ No changes detected across any package, skipping publish step altogether',
      );
      process.exit(0);
    }

    /**
     * In order for the `npm publish --dry-run` to produce any kind of valuable output, we have to
     * modify the package versions on disk to a unique version before running it, otherwise it will
     * simply print `You cannot publish over the previously published versions: X.X.X`.
     *
     * Therefore we will leverage our apply-canary-version.mts script to do this for us in this case.
     */
    if (options.dryRun) {
      console.log(
        '⚠️ NOTE: Applying canary version to package.json files so that dry-run publishing produces useful output...',
      );
      execa.sync('pnpm', ['tsx', 'tools/scripts/apply-canary-version.ts']);
      console.log(
        '✅ Applied canary version to package.json files so that dry-run publishing produces useful output\n',
      );
    }

    const publishProjectsResult = await releasePublish({
      dryRun: options.dryRun,
      firstRelease: options.firstRelease,
      verbose: options.verbose,
    });

    // Revert all temporary changes
    if (options.dryRun) {
      console.log(
        '⚠️ NOTE: Reverting temporary package.json changes related to dry-run publishing...',
      );
      execa.sync('git', [
        'checkout',
        'packages/**/package.json',
        'package.json',
        'pnpm-lock.yaml',
      ]);
      console.log(
        '✅ Reverted temporary package.json changes related to dry-run publishing\n',
      );
    }

    // eslint-disable-next-line no-process-exit
    process.exit(
      // If any of the individual project publish tasks returned a non-zero exit code, exit with code 1
      Object.values(publishProjectsResult).some(({ code }) => code !== 0)
        ? 1
        : 0,
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
