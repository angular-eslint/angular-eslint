import { createBuilder } from '@angular-devkit/architect';
import { CLIEngine } from 'eslint';
import path from 'path';
import { loadESLint, lint } from './utils/eslint-utils';
import { createProgram } from './utils/ts-utils';

async function run(options: any, context: any): Promise<any> {
  const systemRoot = context.workspaceRoot;
  process.chdir(context.currentDirectory);
  const projectName = (context.target && context.target.project) || '<???>';

  const printInfo = options.format && !options.silent;

  context.reportStatus(`Linting ${JSON.stringify(projectName)}...`);
  if (printInfo) {
    context.logger.info(`\nLinting ${JSON.stringify(projectName)}...`);
  }

  const projectESLint = await loadESLint();
  // TODO: Fix upstream type info, missing static version property
  const version =
    (projectESLint.Linter as any).version &&
    (projectESLint.Linter as any).version.split('.');
  if (
    !version ||
    version.length < 2 ||
    Number(version[0]) < 6 ||
    (Number(version[0]) === 6 && Number(version[1]) < 1)
  ) {
    throw new Error('ESLint must be version 6.1 or higher.');
  }

  /**
   * We want users to have the option of not specifying the config path, and let
   * eslint automatically resolve the `.eslintrc` files in each folder.
   */
  const eslintConfigPath = options.eslintConfig
    ? path.resolve(systemRoot, options.eslintConfig)
    : undefined;

  let lintReports: CLIEngine.LintReport[] = [];
  const lintedFiles = new Set<string>();

  if (options.tsConfig) {
    const tsConfigs = Array.isArray(options.tsConfig)
      ? options.tsConfig
      : [options.tsConfig];

    context.reportProgress(0, tsConfigs.length);

    const allPrograms = tsConfigs.map((tsConfig: any) =>
      createProgram(path.resolve(systemRoot, tsConfig)),
    );

    let i = 0;
    for (const program of allPrograms) {
      lintReports = [
        ...lintReports,
        ...(await lint(
          systemRoot,
          eslintConfigPath,
          options,
          lintedFiles,
          program,
          allPrograms,
        )),
      ];
      context.reportProgress(++i, allPrograms.length);
    }
  } else {
    lintReports = [
      ...lintReports,
      ...(await lint(systemRoot, eslintConfigPath, options, lintedFiles)),
    ];
  }

  if (lintReports.length === 0) {
    throw new Error('Invalid lint configuration. Nothing to lint.');
  }

  // TODO: Fix upstream type info, missing static method
  const formatter = (projectESLint.CLIEngine as any).getFormatter(
    options.format,
  );

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const report of lintReports) {
    // output fixes to disk
    projectESLint.CLIEngine.outputFixes(report);

    if (report.errorCount || report.warningCount) {
      totalErrors += report.errorCount;
      totalWarnings += report.warningCount;
      context.logger.info(formatter(report.results));
    }
  }

  if (totalWarnings > 0 && printInfo) {
    context.logger.warn('Lint warnings found in the listed files.\n');
  }

  if (totalErrors > 0 && printInfo) {
    context.logger.error('Lint errors found in the listed files.\n');
  }

  if (totalWarnings === 0 && totalErrors === 0 && printInfo) {
    context.logger.info('All files pass linting.\n');
  }

  return {
    success: options.force || totalErrors === 0,
  };
}

export default createBuilder(run);
