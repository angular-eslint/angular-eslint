import { ESLint } from 'eslint';
import { Schema } from '../schema';
import { getFilesToLint } from './file-utils';

export async function loadESLint() {
  let eslint;
  try {
    eslint = await import('eslint');
    return eslint;
  } catch {
    throw new Error('Unable to find ESLint. Ensure ESLint is installed.');
  }
}

export async function lint(
  systemRoot: string,
  projectSourceRoot: string = '.',
  eslintConfigPath: string | undefined,
  options: Schema,
  lintedFiles: Set<string>,
  program?: any,
  allPrograms?: any[],
): Promise<ESLint.LintResult[]> {
  const files = getFilesToLint(systemRoot, projectSourceRoot, options, program);

  const projectESLint = await loadESLint();

  const eslint = new projectESLint.ESLint({
    useEslintrc: true,
    overrideConfigFile: eslintConfigPath,
    overrideConfig: {
      parserOptions: {
        project: options.tsConfig,
      },
    },
    ignorePath: options.ignorePath || undefined,
    fix: !!options.fix,
    cache: !!options.cache,
    cacheLocation: options.cacheLocation,
  });

  let lintResults: ESLint.LintResult[] = [];

  for (const file of files) {
    if (file.endsWith('.ts') && program && allPrograms) {
      // If it cannot be found in ANY program, then this is an error.
      if (allPrograms.every((p) => p.getSourceFile(file) === undefined)) {
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

    const results = await eslint.lintFiles([file]);

    lintResults = [...lintResults, ...results];
    lintedFiles.add(file);
  }

  return lintResults;
}
