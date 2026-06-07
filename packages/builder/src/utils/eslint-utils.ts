import type { ESLint } from 'eslint';
import type { Schema } from '../schema';

/**
 * The conventional flat config file names that ESLint resolves automatically.
 *
 * NOTE: this is NOT a restriction on what an explicitly provided config file may
 * be named. ESLint's own `--config`/`overrideConfigFile` accepts a flat config
 * file with any name, and so does this builder (see the legacy eslintrc denylist
 * below). This list only mirrors the names ESLint discovers on its own when no
 * explicit config is given, so we can reconstruct a likely config path for
 * diagnostic messages.
 */
export const defaultFlatConfigNames = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
];

/**
 * Legacy "eslintrc" config file names (e.g. `.eslintrc`, `.eslintrc.json`,
 * `.eslintrc.js`, `.eslintrc.yml`). ESLint removed support for this format in
 * v10 and angular-eslint no longer supports it.
 *
 * We detect these names explicitly so we can surface a helpful error message.
 * Any other file name is passed straight through to ESLint - exactly like
 * ESLint's own `--config`/`overrideConfigFile`, a flat config file can have
 * any name, so we deliberately do NOT require the `eslint.config.*` naming
 * convention for an explicitly provided config file.
 */
const legacyEslintrcConfigFilePattern =
  /(^|[\\/])\.eslintrc(\.(c?js|ya?ml|json))?$/;

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
    legacyEslintrcConfigFilePattern.test(eslintConfigPath)
  ) {
    throw new Error(
      `The ESLint config file "${eslintConfigPath}" uses the legacy "eslintrc" format, which is no longer supported. Please use an ESLint flat config file (it can have any name, e.g. eslint.config.js). See https://eslint.org/docs/latest/use/configure/configuration-files`,
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
