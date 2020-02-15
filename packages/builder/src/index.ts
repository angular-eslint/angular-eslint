import { createBuilder } from '@angular-devkit/architect';
import eslint from 'eslint';
import { existsSync, readFileSync } from 'fs';
import glob from 'glob';
import { Minimatch } from 'minimatch';
import path from 'path';
import ts from 'typescript';

export function stripBom(data: string) {
  return data.replace(/^\uFEFF/, '');
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

/**
 * - Copied from TSLint source:
 *
 * Returns an array of all outputs that are not `undefined`
 */
export function mapDefined<T, U>(
  inputs: ReadonlyArray<T>,
  getOutput: (input: T) => U | undefined,
): U[] {
  const out = [];
  for (const input of inputs) {
    const output = getOutput(input);
    if (output !== undefined) {
      out.push(output);
    }
  }
  return out;
}

/**
 * - Adapted from TSLint source:
 *
 * Returns a list of source file names from a TypeScript program. This includes all referenced
 * files and excludes declaration (".d.ts") files, as well as JSON files, to avoid problems with
 * `resolveJsonModule`.
 */
function getFileNamesFromProgram(program: ts.Program): string[] {
  return mapDefined(program.getSourceFiles(), file =>
    file.fileName.endsWith('.d.ts') ||
    file.fileName.endsWith('.json') ||
    program.isSourceFileFromExternalLibrary(file)
      ? undefined
      : file.fileName,
  );
}

function getFilesToLint(
  root: string,
  options: any,
  program?: ts.Program,
): string[] {
  const ignore = options.exclude;
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

  let programFiles = getFileNamesFromProgram(program);

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

/**
 * - Copied from TSLint source:
 *
 * Generic error typing for EcmaScript errors
 * Define `Error` here to avoid using `Error` from @types/node.
 * Using the `node` version causes a compilation error when this code is used as an npm library if @types/node is not already imported.
 */
export declare class Error {
  public name?: string;
  public message: string;
  public stack?: string;
  constructor(message?: string);
}

/**
 * - Copied from TSLint source:
 *
 * Used to exit the program and display a friendly message without the callstack.
 */
export class FatalError extends Error {
  public static NAME = 'FatalError';
  constructor(public message: string, public innerError?: Error) {
    super(message);
    this.name = FatalError.NAME;

    // Fix prototype chain for target ES5
    Object.setPrototypeOf(this, FatalError.prototype);
  }
}

/**
 * - Adapted from TSLint source:
 *
 * Creates a TypeScript program object from a tsconfig.json file path and optional project directory.
 */
function createProgram(
  configFile: string,
  projectDirectory: string = path.dirname(configFile),
): ts.Program {
  const config = ts.readConfigFile(configFile, ts.sys.readFile);
  if (config.error !== undefined) {
    throw new FatalError(
      ts.formatDiagnostics([config.error], {
        getCanonicalFileName: f => f,
        getCurrentDirectory: process.cwd,
        getNewLine: () => '\n',
      }),
    );
  }
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    parseConfigHost,
    path.resolve(projectDirectory),
    { noEmit: true },
  );
  if (parsed.errors !== undefined) {
    // ignore warnings and 'TS18003: No inputs were found in config file ...'
    const errors = parsed.errors.filter(
      d => d.category === ts.DiagnosticCategory.Error && d.code !== 18003,
    );
    if (errors.length !== 0) {
      throw new FatalError(
        ts.formatDiagnostics(errors, {
          getCanonicalFileName: f => f,
          getCurrentDirectory: process.cwd,
          getNewLine: () => '\n',
        }),
      );
    }
  }
  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);

  return program;
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
  const files = getFilesToLint(systemRoot, options, program);

  const cli = new projectESLint.CLIEngine({
    configFile: eslintConfigPath,
    useEslintrc: false,
    fix: !!options.fix,
    cache: !!options.cache,
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

    /**
     * TODO: this was copied from TSLint builder - is it necessary here?
     */
    // Give some breathing space to other promises that might be waiting.
    await Promise.resolve();
    lintReports.push(cli.executeOnFiles([file]));
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

  const projectESLint = await _loadESLint();
  // TODO: Fix upstream type info, missing static version property
  const version =
    (eslint.Linter as any).version && (eslint.Linter as any).version.split('.');
  if (
    !version ||
    version.length < 2 ||
    Number(version[0]) < 6 ||
    Number(version[1]) < 1
  ) {
    throw new Error('ESLint must be version 6.1 or higher.');
  }

  const eslintConfigPath = path.resolve(systemRoot, options.eslintConfig);

  let lintReports: eslint.CLIEngine.LintReport[] = [];
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
