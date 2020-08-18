import {
  createBuilder,
  BuilderOutput,
  BuilderContext,
} from '@angular-devkit/architect';
import { ESLint } from 'eslint';
import path from 'path';
import { lint, loadESLint } from './utils/eslint-utils';
import { createProgram } from './utils/ts-utils';
import { Schema } from './schema';

async function run(
  options: Schema,
  context: BuilderContext,
): Promise<BuilderOutput> {
  const systemRoot = context.workspaceRoot;
  process.chdir(context.currentDirectory);

  const projectName = context.target?.project || '<???>';
  let projectSourceRoot: string | undefined = undefined;
  try {
    const projectMetadata = await context.getProjectMetadata(projectName);
    projectSourceRoot = projectMetadata.sourceRoot as string;
  } catch {}

  const printInfo = options.format && !options.silent;

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

  let lintResults: ESLint.LintResult[] = [];
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
      lintResults = [
        ...lintResults,
        ...(await lint(
          systemRoot,
          projectSourceRoot,
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
    lintResults = [
      ...lintResults,
      ...(await lint(
        systemRoot,
        projectSourceRoot,
        eslintConfigPath,
        options,
        lintedFiles,
      )),
    ];
  }

  if (lintResults.length === 0) {
    throw new Error('Invalid lint configuration. Nothing to lint.');
  }

  const formatter = await eslint.loadFormatter(options.format);

  let totalErrors = 0;
  let totalWarnings = 0;

  // output fixes to disk, if applicable based on the options
  await projectESLint.ESLint.outputFixes(lintResults);

  for (const result of lintResults) {
    if (result.errorCount || result.warningCount) {
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;
      context.logger.info(formatter.format([result]));
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
