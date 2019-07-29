import { createBuilder } from '@angular-devkit/architect';
import eslint from 'eslint';
import { readFileSync } from 'fs';
import glob from 'glob';
import { Minimatch } from 'minimatch';
import path from 'path';
/**
 * TODO: Remove dependency on tslint
 */
import * as tslint from 'tslint';
import ts from 'typescript';

export function stripBom(data: string) {
  return data.replace(/^\uFEFF/, '');
}

function getFileContents(file: string): string {
  // NOTE: The tslint CLI checks for and excludes MPEG transport streams; this does not.
  try {
    return stripBom(readFileSync(file, 'utf-8'));
  } catch {
    throw new Error(`Could not read file '${file}'.`);
  }
}

async function _loadESLint() {
  let eslint;
  try {
    eslint = await import('eslint');
    return eslint;
  } catch {
    throw new Error('Unable to find ESLint. Ensure ESLint is installed.');
  }
}

function _getFilesToLint(
  root: string,
  options: any,
  linter: typeof tslint.Linter,
  program?: ts.Program,
): string[] {
  /**
   * TODO: Option not implemented yet
   */
  const ignore = options.exclude;
  /**
   * TODO: Option not implemented yet
   */
  const files = options.files || [];

  if (files.length > 0) {
    return files
      .map((file: any) => glob.sync(file, { cwd: root, ignore, nodir: true }))
      .reduce((prev: any, curr: any) => prev.concat(curr), [])
      .map((file: any) => path.join(root, file));
  }

  if (!program) {
    return [];
  }

  /**
   * TODO: Remove dependency on TSLint here
   */
  let programFiles = linter.getFileNames(program);

  if (ignore && ignore.length > 0) {
    // normalize to support ./ paths
    const ignoreMatchers = ignore.map(
      (pattern: any) => new Minimatch(path.normalize(pattern), { dot: true }),
    );

    programFiles = programFiles.filter(
      (file: any) =>
        !ignoreMatchers.some((matcher: any) =>
          matcher.match(path.relative(root, file)),
        ),
    );
  }

  return programFiles;
}

async function _lint(
  projectESLint: typeof eslint,
  systemRoot: string,
  eslintConfigPath: string,
  options: any,
  lintedFiles: Set<string>,
  program?: any,
  allPrograms?: any[],
): Promise<any[]> {
  const files = _getFilesToLint(systemRoot, options, tslint.Linter, program);

  const cli = new projectESLint.CLIEngine({
    configFile: eslintConfigPath,
    useEslintrc: false,
    fix: !!options.fix,
    rules: {
      semi: 2,
    },
  });

  const lintReports: eslint.CLIEngine.LintReport[] = [];

  for (const file of files) {
    if (program && allPrograms) {
      // If it cannot be found in ANY program, then this is an error.
      if (allPrograms.every(p => p.getSourceFile(file) === undefined)) {
        throw new Error(
          `File ${JSON.stringify(file)} is not part of a TypeScript project '${
            options.tsConfig
          }'.`,
        );
      } else if (program.getSourceFile(file) === undefined) {
        // The file exists in some other programs. We will lint it later (or earlier) in the loop.
        continue;
      }
    }

    // Already linted the current file, so skip it here...
    if (lintedFiles.has(file)) {
      continue;
    }

    const contents = getFileContents(file);

    /**
     * TODO: this was copied from TSLint builder - is it necessary here?
     */
    // Give some breathing space to other promises that might be waiting.
    await Promise.resolve();
    lintReports.push(cli.executeOnText(contents, file));
    lintedFiles.add(file);
  }

  return lintReports;
}

async function _run(options: any, context: any): Promise<any> {
  const systemRoot = context.workspaceRoot;
  process.chdir(context.currentDirectory);
  const projectName = (context.target && context.target.project) || '<???>';

  const printInfo = options.format && !options.silent;

  context.reportStatus(`Linting ${JSON.stringify(projectName)}...`);
  if (printInfo) {
    context.logger.info(`\nLinting ${JSON.stringify(projectName)}...`);
  }

  /**
   * TODO: version 5.5 was the TSLint one, figure out the actually constraints for TSLint
   */
  const projectESLint = await _loadESLint();
  // TODO: Fix upstream type info, missing static version property
  const version =
    (eslint.Linter as any).version && (eslint.Linter as any).version.split('.');
  if (
    !version ||
    version.length < 2 ||
    Number(version[0]) < 5 ||
    Number(version[1]) < 5
  ) {
    throw new Error('ESLint must be version 5.5 or higher.');
  }

  const eslintConfigPath = path.resolve(systemRoot, options.eslintConfig);

  let lintReports: eslint.CLIEngine.LintReport[] = [];
  const lintedFiles = new Set<string>();

  if (options.tsConfig) {
    const tsConfigs = Array.isArray(options.tsConfig)
      ? options.tsConfig
      : [options.tsConfig];

    context.reportProgress(0, tsConfigs.length);

    /**
     * TODO: Remove dependency on TSLint here
     */
    const allPrograms = tsConfigs.map((tsConfig: any) => {
      return tslint.Linter.createProgram(path.resolve(systemRoot, tsConfig));
    });

    let i = 0;
    for (const program of allPrograms) {
      lintReports = [
        ...lintReports,
        ...(await _lint(
          projectESLint,
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
      ...(await _lint(
        projectESLint,
        systemRoot,
        eslintConfigPath,
        options,
        lintedFiles,
      )),
    ];
  }

  if (lintReports.length === 0) {
    throw new Error('Invalid lint configuration. Nothing to lint.');
  }

  // TODO: Fix upstream type info, missing static method
  const formatter = (eslint.CLIEngine as any).getFormatter(options.format);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const report of lintReports) {
    // output fixes to disk
    eslint.CLIEngine.outputFixes(report);

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

export default createBuilder(_run);
