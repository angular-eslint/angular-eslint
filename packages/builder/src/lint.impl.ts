import type { BuilderOutput } from '@angular-devkit/architect';
import { convertNxExecutor } from '@nx/devkit';
import type { ESLint } from 'eslint';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type { Schema } from './schema';
import { lint, loadESLint } from './utils/eslint-utils';

export default convertNxExecutor(
  async (options: Schema, context): Promise<BuilderOutput> => {
    const systemRoot = context.root;

    // eslint resolves files relative to the current working directory.
    // We want these paths to always be resolved relative to the workspace
    // root to be able to run the lint executor from any subfolder.
    process.chdir(systemRoot);

    const projectName = context.projectName || '<???>';
    const printInfo = options.format && !options.silent;

    if (printInfo) {
      console.info(`\nLinting ${JSON.stringify(projectName)}...`);
    }

    const projectESLint: { ESLint: typeof ESLint } = await loadESLint();
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
     * eslint automatically resolve the `.eslintrc.json` files in each folder.
     */
    const eslintConfigPath = options.eslintConfig
      ? resolve(systemRoot, options.eslintConfig)
      : undefined;

    options.cacheLocation = options.cacheLocation
      ? join(options.cacheLocation, projectName)
      : null;

    let lintResults: ESLint.LintResult[] = [];

    try {
      lintResults = await lint(eslintConfigPath, options);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes(
          'You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser',
        )
      ) {
        let eslintConfigPathForError = `for ${projectName}`;
        if (context.projectsConfigurations?.projects?.[projectName]?.root) {
          const { root } = context.projectsConfigurations.projects[projectName];
          eslintConfigPathForError = `\`${root}/.eslintrc.json\``;
        }

        console.error(`
Error: You have attempted to use a lint rule which requires the full TypeScript type-checker to be available, but you do not have \`parserOptions.project\` configured to point at your project tsconfig.json files in the relevant TypeScript file "overrides" block of your project ESLint config ${
          eslintConfigPath || eslintConfigPathForError
        }

For full guidance on how to resolve this issue, please see https://github.com/angular-eslint/angular-eslint/blob/main/docs/RULES_REQUIRING_TYPE_INFORMATION.md
`);

        return {
          success: false,
        };
      }
      // If some unexpected error, rethrow
      throw err;
    }

    if (lintResults.length === 0) {
      const ignoredPatterns = (
        await Promise.all(
          options.lintFilePatterns.map(async (pattern) =>
            (await eslint.isPathIgnored(pattern)) ? pattern : null,
          ),
        )
      )
        .filter((pattern) => !!pattern)
        .map((pattern) => `- '${pattern}'`);
      if (ignoredPatterns.length) {
        throw new Error(
          `All files matching the following patterns are ignored:\n${ignoredPatterns.join(
            '\n',
          )}\n\nPlease check your '.eslintignore' file.`,
        );
      }
      throw new Error(
        'Invalid lint configuration. Nothing to lint. Please check your lint target pattern(s).',
      );
    }

    // output fixes to disk, if applicable based on the options
    await projectESLint.ESLint.outputFixes(lintResults);

    const formatter = await eslint.loadFormatter(options.format);

    let totalErrors = 0;
    let totalWarnings = 0;

    const reportOnlyErrors = options.quiet;
    const maxWarnings = options.maxWarnings;

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

    const hasWarningsToPrint: boolean = totalWarnings > 0 && !reportOnlyErrors;
    const hasErrorsToPrint: boolean = totalErrors > 0;

    /**
     * It's important that we format all results together so that custom
     * formatters, such as checkstyle, can provide a valid output for the
     * whole project being linted.
     *
     * Additionally, apart from when outputting to a file, we want to always
     * log (even when no results) because different formatters handled the
     * "no results" case differently.
     */
    const formattedResults = await formatter.format(finalLintResults);

    if (options.outputFile) {
      const pathToOutputFile = join(context.root, options.outputFile);
      mkdirSync(dirname(pathToOutputFile), { recursive: true });
      writeFileSync(pathToOutputFile, formattedResults);
    } else {
      console.info(formattedResults);
    }

    if (hasWarningsToPrint && printInfo) {
      console.warn('Lint warnings found in the listed files.\n');
    }

    if (hasErrorsToPrint && printInfo) {
      console.error('Lint errors found in the listed files.\n');
    }

    if (
      (totalWarnings === 0 || reportOnlyErrors) &&
      totalErrors === 0 &&
      printInfo
    ) {
      console.info('All files pass linting.\n');
    }

    const tooManyWarnings = maxWarnings >= 0 && totalWarnings > maxWarnings;
    if (tooManyWarnings && printInfo) {
      console.error(
        `Found ${totalWarnings} warnings, which exceeds your configured limit (${options.maxWarnings}). Either increase your maxWarnings limit or fix some of the lint warnings.`,
      );
    }

    return {
      success: options.force || (totalErrors === 0 && !tooManyWarnings),
    };
  },
);
