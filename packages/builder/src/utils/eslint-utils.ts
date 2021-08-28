import type * as ESLintLibrary from 'eslint';
import { join } from 'path';
import type { Schema } from '../schema';

export async function loadESLint(): Promise<typeof ESLintLibrary> {
  let eslint;
  try {
    eslint = await import('eslint');
    return eslint;
  } catch {
    throw new Error('Unable to find ESLint. Ensure ESLint is installed.');
  }
}

export async function lint(
  workspaceRoot: string,
  eslintConfigPath: string | undefined,
  options: Schema,
): Promise<ESLintLibrary.ESLint.LintResult[]> {
  const projectESLint = await loadESLint();

  const eslint = new projectESLint.ESLint({
    /**
     * If "noEslintrc" is set to `true` (and therefore here "useEslintrc" will be `false`), then ESLint will not
     * merge the provided config with others it finds automatically.
     */
    useEslintrc: !options.noEslintrc,
    overrideConfigFile: eslintConfigPath,
    ignorePath: options.ignorePath || undefined,
    fix: !!options.fix,
    cache: !!options.cache,
    cacheLocation: options.cacheLocation || undefined,
    cacheStrategy: options.cacheStrategy || undefined,
    resolvePluginsRelativeTo: options.resolvePluginsRelativeTo || undefined,
    rulePaths: options.rulesdir || [],
    /**
     * Default is `true` and if not overridden the eslint.lintFiles() method will throw an error
     * when no target files are found.
     *
     * We don't want ESLint to throw an error if a user has only just created
     * a project and therefore doesn't necessarily have matching files, for example.
     */
    errorOnUnmatchedPattern: false,
  });

  return await eslint.lintFiles(
    // lintFilePatterns are defined relative to the root of the Angular-CLI workspace
    options.lintFilePatterns.map((p) => join(workspaceRoot, p)),
  );
}
