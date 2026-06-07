import type { ESLint } from 'eslint';
import type { Schema } from '../schema';

export const supportedFlatConfigNames = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
];

async function resolveESLintClass(): Promise<typeof ESLint> {
  try {
    const eslint = await import('eslint');
    return eslint.ESLint;
  } catch {
    throw new Error('Unable to find ESLint. Ensure ESLint is installed.');
  }
}

function validateConcurrency(concurrency: string | number) {
  if (concurrency === 'auto' || concurrency === 'off') {
    return;
  }
  if (
    typeof concurrency === 'number' &&
    Number.isInteger(concurrency) &&
    concurrency > 0
  ) {
    return;
  }
  throw new Error(
    'The --concurrency option must be auto, off or a positive integer',
  );
}

export async function resolveAndInstantiateESLint(
  eslintConfigPath: string | undefined,
  options: Schema,
) {
  if (
    eslintConfigPath &&
    !supportedFlatConfigNames.some((name) => eslintConfigPath.endsWith(name))
  ) {
    throw new Error(
      `ESLint configuration files must be named ${supportedFlatConfigNames.join(' or ')}; legacy .eslintrc files are no longer supported. See https://eslint.org/docs/latest/use/configure/configuration-files`,
    );
  }
  const ESLint = await resolveESLintClass();

  const eslintOptions: ESLint.Options & {
    concurrency?: 'auto' | 'off' | number;
    applySuppressions?: boolean;
    suppressionsLocation?: string;
  } = {
    fix: !!options.fix,
    cache: !!options.cache,
    cacheLocation: options.cacheLocation || undefined,
    cacheStrategy: options.cacheStrategy || undefined,
    /**
     * Default is `true` and if not overridden the eslint.lintFiles() method will throw an error
     * when no target files are found.
     *
     * We don't want ESLint to throw an error if a user has only just created
     * a project and therefore doesn't necessarily have matching files, for example.
     *
     * Also, the angular generator creates a lint pattern for `html` files, but there may
     * not be any html files in the project, so keeping it true would break linting every time
     */
    errorOnUnmatchedPattern: false,
  };

  const concurrency = options.concurrency;
  if (concurrency != null) {
    validateConcurrency(concurrency);
    eslintOptions.concurrency = concurrency;
  }

  eslintOptions.stats = !!options.stats;
  if (options.applySuppressions) {
    eslintOptions.applySuppressions = true;
  }
  if (options.suppressionsLocation) {
    eslintOptions.suppressionsLocation = options.suppressionsLocation;
  }

  /**
   * Adapted from https://github.com/eslint/eslint/blob/50f03a119e6827c03b1d6c86d3aa1f4820b609e8/lib/cli.js#L144
   */
  if (typeof options.noConfigLookup !== 'undefined') {
    const configLookup = !options.noConfigLookup;
    let overrideConfigFile: string | undefined | boolean =
      typeof eslintConfigPath === 'string' ? eslintConfigPath : !configLookup;
    if (overrideConfigFile === false) {
      overrideConfigFile = undefined;
    }
    eslintOptions.overrideConfigFile = overrideConfigFile;
  } else {
    eslintOptions.overrideConfigFile = eslintConfigPath;
  }

  const eslint = new ESLint(eslintOptions);

  return {
    ESLint,
    eslint,
  };
}
