import type { TSESLint } from '@typescript-eslint/utils';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { format, resolveConfig } from 'prettier';
import eslintPluginTemplate from '../../packages/eslint-plugin-template/src';
import eslintPlugin from '../../packages/eslint-plugin/src';

interface LinterConfigRules {
  [name: string]:
    | TSESLint.Linter.RuleLevel
    | TSESLint.Linter.RuleLevelAndOptions;
}

interface LinterConfig extends TSESLint.Linter.Config {
  extends?: string | string[];
  plugins?: string[];
}

const eslintPluginMaxRuleNameLength = Object.keys(eslintPlugin.rules).reduce(
  (acc, name) => Math.max(acc, name.length),
  0,
);
const eslintPluginTemplateMaxRuleNameLength = Object.keys(
  eslintPluginTemplate.rules,
).reduce((acc, name) => Math.max(acc, name.length), 0);

const MAX_RULE_NAME_LENGTH =
  eslintPluginMaxRuleNameLength > eslintPluginTemplateMaxRuleNameLength
    ? eslintPluginMaxRuleNameLength
    : eslintPluginTemplateMaxRuleNameLength;

const DEFAULT_RULE_SETTING = 'warn';

const eslintPluginRuleEntries = Object.entries(eslintPlugin.rules).sort(
  (a, b) => a[0].localeCompare(b[0]),
);
const eslintPluginTemplateRuleEntries = Object.entries(
  eslintPluginTemplate.rules,
).sort((a, b) => a[0].localeCompare(b[0]));

/**
 * Helper function reduces records to key - value pairs.
 * @param config
 * @param entry
 * @param settings
 */
function reducer(
  ruleNamePrefix: '@angular-eslint/' | '@angular-eslint/template/',
  config: LinterConfigRules,
  entry: [string, TSESLint.RuleModule<string, unknown[]>],
  settings: {
    errorLevel?: 'error' | 'warn';
    filterDeprecated: boolean;
    filterRequiresTypeChecking?: 'include' | 'exclude';
  },
): LinterConfigRules {
  const key = entry[0];
  const value = entry[1];

  if (settings.filterDeprecated && value.meta.deprecated) {
    return config;
  }

  // Explicitly exclude rules requiring type-checking
  if (
    settings.filterRequiresTypeChecking === 'exclude' &&
    value.meta.docs?.requiresTypeChecking === true
  ) {
    return config;
  }

  // Explicitly include rules requiring type-checking
  if (
    settings.filterRequiresTypeChecking === 'include' &&
    value.meta.docs?.requiresTypeChecking !== true
  ) {
    return config;
  }

  const ruleName = `${ruleNamePrefix}${key}`;
  const recommendation = value.meta.docs?.recommended;
  const usedSetting:
    | TSESLint.Linter.RuleLevel
    | TSESLint.Linter.RuleLevelAndOptions
    | 'strict' = settings.errorLevel
    ? settings.errorLevel
    : !recommendation
    ? DEFAULT_RULE_SETTING
    : recommendation;

  console.log(
    `${chalk.dim(ruleNamePrefix)}${key.padEnd(MAX_RULE_NAME_LENGTH)}`,
    '=',
    usedSetting === 'error'
      ? chalk.red(usedSetting)
      : chalk.yellow(usedSetting),
  );
  if (usedSetting !== 'strict') {
    config[ruleName] = usedSetting;
  }

  return config;
}

/**
 * Helper function writes configuration.
 */
async function writeConfig(
  config: LinterConfig,
  filePath: string,
): Promise<void> {
  const configStr = await format(JSON.stringify(config), {
    ...(await resolveConfig(__dirname)),
    parser: 'json',
  });
  fs.writeFileSync(filePath, configStr);
}

(async function main() {
  console.log();
  console.log(
    '------------------------------------------------ eslint-plugin/all.json ------------------------------------------------',
  );
  const allConfig: LinterConfig = {
    parser: '@typescript-eslint/parser',
    plugins: ['@angular-eslint'],
    rules: {
      ...eslintPluginRuleEntries.reduce<LinterConfigRules>(
        (config, entry) =>
          reducer('@angular-eslint/', config, entry, {
            errorLevel: 'error',
            filterDeprecated: true,
          }),
        {},
      ),
    },
  };
  writeConfig(
    allConfig,
    path.resolve(
      __dirname,
      '../../packages/eslint-plugin/src/configs/all.json',
    ),
  );

  console.log();
  console.log(
    '------------------------------ eslint-plugin/recommended.json ------------------------------',
  );

  const recommendedConfig: LinterConfig = {
    parser: '@typescript-eslint/parser',
    plugins: ['@angular-eslint'],
    rules: {
      ...eslintPluginRuleEntries
        .filter((entry) => !!entry[1].meta.docs?.recommended)
        .reduce<LinterConfigRules>(
          (config, entry) =>
            reducer('@angular-eslint/', config, entry, {
              filterDeprecated: false,
              filterRequiresTypeChecking: 'exclude',
            }),
          {},
        ),
    },
  };
  writeConfig(
    recommendedConfig,
    path.resolve(
      __dirname,
      '../../packages/eslint-plugin/src/configs/recommended.json',
    ),
  );

  console.log();
  console.log(
    '------------------------------------------------ eslint-plugin-template/all.json ------------------------------------------------',
  );
  const allTemplateConfig: LinterConfig = {
    parser: '@angular-eslint/template-parser',
    plugins: ['@angular-eslint/template'],
    rules: eslintPluginTemplateRuleEntries.reduce<LinterConfigRules>(
      (config, entry) =>
        reducer('@angular-eslint/template/', config, entry, {
          errorLevel: 'error',
          filterDeprecated: false,
        }),
      {},
    ),
  };
  writeConfig(
    allTemplateConfig,
    path.resolve(
      __dirname,
      '../../packages/eslint-plugin-template/src/configs/all.json',
    ),
  );

  console.log();
  console.log(
    '------------------------------ eslint-plugin-template/recommended.json ------------------------------',
  );

  const recommendedTemplateConfig: LinterConfig = {
    parser: '@angular-eslint/template-parser',
    plugins: ['@angular-eslint/template'],
    rules: eslintPluginTemplateRuleEntries
      .filter((entry) => !!entry[1].meta.docs?.recommended)
      .reduce<LinterConfigRules>(
        (config, entry) =>
          reducer('@angular-eslint/template/', config, entry, {
            filterDeprecated: false,
            filterRequiresTypeChecking: 'exclude',
          }),
        {},
      ),
  };
  writeConfig(
    recommendedTemplateConfig,
    path.resolve(
      __dirname,
      '../../packages/eslint-plugin-template/src/configs/recommended.json',
    ),
  );

  console.log();
  console.log(
    '------------------------------ eslint-plugin-template/accessibility.json ------------------------------',
  );

  const accessibilityTemplateConfig: LinterConfig = {
    parser: '@angular-eslint/template-parser',
    plugins: ['@angular-eslint/template'],
    rules: eslintPluginTemplateRuleEntries
      .filter(
        (entry) =>
          !!entry[1].meta.docs?.description.startsWith('[Accessibility]'),
      )
      .reduce<LinterConfigRules>(
        (config, entry) =>
          reducer('@angular-eslint/template/', config, entry, {
            filterDeprecated: false,
            errorLevel: 'error',
            filterRequiresTypeChecking: 'exclude',
          }),
        {},
      ),
  };
  writeConfig(
    accessibilityTemplateConfig,
    path.resolve(
      __dirname,
      '../../packages/eslint-plugin-template/src/configs/accessibility.json',
    ),
  );
})();
