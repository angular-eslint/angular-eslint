import type { Linter as ESLintLinter } from 'eslint';
import {
  createESLintConfiguration,
  findReportedConfiguration,
  joinConfigConversionResults,
  TSLintRuleOptions,
} from 'tslint-to-eslint-config';

export async function convertToESLintConfig(
  pathToTslintJson: string,
  tslintJson: Record<string, unknown>,
): Promise<{
  convertedESLintConfig: ESLintLinter.Config;
  unconvertedTSLintRules: TSLintRuleOptions[];
  ensureESLintPlugins: string[];
}> {
  const reportedConfiguration = await findReportedConfiguration(
    'npx tslint --print-config',
    pathToTslintJson,
  );

  if (reportedConfiguration instanceof Error) {
    if (
      reportedConfiguration.message.includes('unknown option `--print-config')
    ) {
      throw new Error(
        '\nError: TSLint v5.18 required in order to run this schematic. Please update your version and try again.\n',
      );
    }
    /**
     * Make a print-config issue easier to understand for the end user.
     * This error could occur if, for example, the user does not have a TSLint plugin installed correctly that they
     * reference in their config.
     */
    const printConfigFailureMessageStart =
      'Command failed: npx tslint --print-config "tslint.json"';
    if (
      reportedConfiguration.message.startsWith(printConfigFailureMessageStart)
    ) {
      throw new Error(
        `\nThere was a critical error when trying to inspect your tslint.json: \n${reportedConfiguration.message.replace(
          printConfigFailureMessageStart,
          '',
        )}`,
      );
    }

    throw new Error(`Unexpected error: ${reportedConfiguration.message}`);
  }

  const originalConfigurations = {
    tslint: {
      full: reportedConfiguration,
      raw: tslintJson,
    },
  };

  const summarizedConfiguration = await createESLintConfiguration(
    originalConfigurations,
  );

  // These are already covered by our recommended config, and are installed by the `ng add` schematic
  const expectedESLintPlugins = [
    'eslint-plugin-jsdoc',
    'eslint-plugin-prefer-arrow',
    'eslint-plugin-import',
    '@angular-eslint/eslint-plugin',
    '@angular-eslint/eslint-plugin-template',
  ];

  const convertedESLintConfig = joinConfigConversionResults(
    summarizedConfiguration,
    originalConfigurations,
  ) as ESLintLinter.Config;

  return {
    convertedESLintConfig,
    unconvertedTSLintRules: summarizedConfiguration.missing,
    ensureESLintPlugins: Array.from(summarizedConfiguration.plugins).filter(
      (pluginName) => !expectedESLintPlugins.includes(pluginName),
    ),
  };
}
