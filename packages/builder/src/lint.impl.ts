import type { ExecutorContext } from '@nrwl/devkit';
import type { ESLint } from 'eslint';
import { writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type { Schema } from './schema';
import { createDirectory } from './utils/create-directory';
import { lint, loadESLint } from './utils/eslint-utils';

export default async function run(
  options: Schema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const workspaceRoot = context.root;
  process.chdir(workspaceRoot);

  const projectName = context.projectName || '<???>';
  const printInfo = options.format && !options.silent;
  const reportOnlyErrors = options.quiet;
  const maxWarnings = options.maxWarnings;

  if (printInfo) {
    console.info(`\nLinting ${JSON.stringify(projectName)}...`);
  }

  const projectESLint = await loadESLint();
  const version = projectESLint.ESLint?.version?.split('.');
  if (
    !version ||
    version.length < 2 ||
    Number(version[0]) < 7 ||
    (Number(version[0]) === 7 && Number(version[1]) < 6)
  ) {
    throw new Error('ESLint must be version 7.6 or higher.');
  }

  const eslint = new projectESLint.ESLint({});

  /**
   * We want users to have the option of not specifying the config path, and let
   * eslint automatically resolve the `.eslintrc` files in each folder.
   */
  const eslintConfigPath = options.eslintConfig
    ? resolve(workspaceRoot, options.eslintConfig)
    : undefined;

  const lintResults: ESLint.LintResult[] = await lint(
    workspaceRoot,
    eslintConfigPath,
    options,
  );

  if (lintResults.length === 0) {
    throw new Error('Invalid lint configuration. Nothing to lint.');
  }

  const formatter = await eslint.loadFormatter(options.format);

  let totalErrors = 0;
  let totalWarnings = 0;

  // output fixes to disk, if applicable based on the options
  await projectESLint.ESLint.outputFixes(lintResults);

  /**
   * Depending on user configuration we may not want to report on all the
   * results, so we need to adjust them before formatting.
   */
  const finalLintResults: ESLint.LintResult[] = lintResults
    .map((result): ESLint.LintResult | null => {
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;

      if (result.errorCount || (result.warningCount && !reportOnlyErrors)) {
        if (reportOnlyErrors) {
          // Collect only errors (Linter.Severity === 2)
          result.messages = result.messages.filter(
            ({ severity }) => severity === 2,
          );
        }

        return result;
      }

      return null;
    })
    // Filter out the null values
    .filter(Boolean) as ESLint.LintResult[];

  const hasWarningsToPrint: boolean = totalWarnings > 0 && !reportOnlyErrors;
  const hasErrorsToPrint: boolean = totalErrors > 0;

  /**
   * It's important that we format all results together so that custom
   * formatters, such as checkstyle, can provide a valid output for the
   * whole project being linted.
   *
   * Additionally, apart from when outputting to a file, we want to always
   * log (even when no results) because different formatters handled the
   * "no results" case differently.
   */
  const formattedResults = await formatter.format(finalLintResults);

  if (options.outputFile) {
    const pathToOutputFile = join(context.root, options.outputFile);
    createDirectory(dirname(pathToOutputFile));
    writeFileSync(pathToOutputFile, formattedResults);
  } else {
    console.info(formattedResults);
  }

  if (hasWarningsToPrint && printInfo) {
    console.warn('Lint warnings found in the listed files.\n');
  }

  if (hasErrorsToPrint && printInfo) {
    console.error('Lint errors found in the listed files.\n');
  }

  if (
    (totalWarnings === 0 || reportOnlyErrors) &&
    totalErrors === 0 &&
    printInfo
  ) {
    console.info('All files pass linting.\n');
  }

  const tooManyWarnings = maxWarnings >= 0 && totalWarnings > maxWarnings;
  if (tooManyWarnings && printInfo) {
    console.error(
      `Found ${totalWarnings} warnings, which exceeds your configured limit (${options.maxWarnings}). Either increase your maxWarnings limit or fix some of the lint warnings.`,
    );
  }

  return {
    success: options.force || (totalErrors === 0 && !tooManyWarnings),
  };
}
