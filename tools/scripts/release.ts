import { joinPathFragments, workspaceRoot } from '@nx/devkit';
import * as chalk from 'chalk';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { releaseChangelog, releaseVersion } from 'nx/src/command-line/release';
import { gitAdd } from 'nx/src/command-line/release/utils/git';
import { printDiff } from 'nx/src/command-line/release/utils/print-changes';
import { FileChange, Tree, flushChanges } from 'nx/src/generators/tree';
import yargs from 'yargs';

(async () => {
  try {
    const options = await yargs
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
      .option('verbose', {
        description:
          'Whether or not to enable verbose logging, defaults to false',
        type: 'boolean',
        default: false,
      })
      .parseAsync();

    // Prepare the packages for publishing
    execSync('yarn build', {
      stdio: 'inherit',
      maxBuffer: 1024 * 1000000,
    });

    const {
      workspaceVersion,
      projectsVersionData,
      restoreLocalDependencyReferencesCallbacks,
      tree,
    } = await releaseVersion({
      specifier: options.version,
      // stage package.json updates to be committed later by the changelog command
      stageChanges: true,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    console.log('⚠️ Restoring local package dependency references');

    for (const cb of restoreLocalDependencyReferencesCallbacks) {
      await cb();
    }

    const changes = printAndFlushChanges(tree, options.dryRun);

    if (changes.length) {
      await gitAdd({
        changedFiles: changes.map((f) => f.path),
        dryRun: options.dryRun,
        verbose: options.verbose,
      });
    }

    // This will create a release on GitHub, which will act as a trigger for the publish.yml workflow
    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      interactive: 'workspace',
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

function printAndFlushChanges(tree: Tree, isDryRun: boolean): FileChange[] {
  const changes = tree.listChanges();

  console.log('');

  // Print the changes
  changes.forEach((f) => {
    if (f.type === 'CREATE') {
      console.error(
        `${chalk.green('CREATE')} ${f.path}${
          isDryRun ? chalk.keyword('orange')(' [dry-run]') : ''
        }`,
      );
      printDiff('', f.content?.toString() || '');
    } else if (f.type === 'UPDATE') {
      console.error(
        `${chalk.white('UPDATE')} ${f.path}${
          isDryRun ? chalk.keyword('orange')(' [dry-run]') : ''
        }`,
      );
      const currentContentsOnDisk = readFileSync(
        joinPathFragments(tree.root, f.path),
      ).toString();
      printDiff(currentContentsOnDisk, f.content?.toString() || '');
    } else if (f.type === 'DELETE') {
      throw new Error(
        'Unexpected DELETE change, please report this as an issue',
      );
    }
  });

  if (!isDryRun) {
    flushChanges(workspaceRoot, changes);
  }

  return changes;
}
