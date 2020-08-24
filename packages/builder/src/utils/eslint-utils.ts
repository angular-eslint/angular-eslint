import { ESLint } from 'eslint';
import { Schema } from '../schema';

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
  eslintConfigPath: string | undefined,
  options: Schema,
): Promise<ESLint.LintResult[]> {
  const projectESLint = await loadESLint();

  const eslint = new projectESLint.ESLint({
    useEslintrc: true,
    overrideConfigFile: eslintConfigPath,
    ignorePath: options.ignorePath || undefined,
    fix: !!options.fix,
    cache: !!options.cache,
    cacheLocation: options.cacheLocation || undefined,
  });

  return await eslint.lintFiles(options.lintFilePatterns);
}
