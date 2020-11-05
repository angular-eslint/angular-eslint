import type { Linter as ESLintLinter } from 'eslint';
import {
  createESLintConfiguration,
  findReportedConfiguration,
  joinConfigConversionResults,
} from 'tslint-to-eslint-config';

type TSLintRuleSeverity = 'warning' | 'error' | 'off';
type TSLintRuleOptions = {
  ruleArguments: any[];
  ruleName: string;
  ruleSeverity: TSLintRuleSeverity;
};

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
