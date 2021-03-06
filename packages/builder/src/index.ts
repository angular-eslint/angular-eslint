import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { ESLint } from 'eslint';
import path from 'path';
import { Schema } from './schema';
import { lint, loadESLint } from './utils/eslint-utils';

async function run(
  options: Schema,
  context: BuilderContext,
): Promise<BuilderOutput> {
  const systemRoot = context.workspaceRoot;
  process.chdir(context.currentDirectory);

  const projectName = context.target?.project || '<???>';
  const printInfo = options.format && !options.silent;
  const reportOnlyErrors = options.quiet;

  context.reportStatus(`Linting ${JSON.stringify(projectName)}...`);
  if (printInfo) {
    context.logger.info(`\nLinting ${JSON.stringify(projectName)}...`);
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
    ? path.resolve(systemRoot, options.eslintConfig)
    : undefined;

  const lintResults: ESLint.LintResult[] = await lint(
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

  const hasWarningsToPrint: boolean =
    totalWarnings > 0 && printInfo && !reportOnlyErrors;
  const hasErrorsToPrint: boolean = totalErrors > 0 && printInfo;

  /**
   * It's important that we format all results together so that custom
   * formatters, such as checkstyle, can provide a valid output for the
   * whole project being linted.
   */
  if (hasWarningsToPrint || hasErrorsToPrint) {
    context.logger.info(formatter.format(finalLintResults));
  }

  if (hasWarningsToPrint) {
    context.logger.warn('Lint warnings found in the listed files.\n');
  }

  if (hasErrorsToPrint) {
    context.logger.error('Lint errors found in the listed files.\n');
  }

  if (
    (totalWarnings === 0 || reportOnlyErrors) &&
    totalErrors === 0 &&
    printInfo
  ) {
    context.logger.info('All files pass linting.\n');
  }

  return {
    success: options.force || totalErrors === 0,
  };
}

export default createBuilder(run);
