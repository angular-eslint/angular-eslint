import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { format, resolveConfig } from 'prettier';
import eslintPlugin from '../../packages/eslint-plugin/src';
import eslintPluginTemplate from '../../packages/eslint-plugin-template/src';

const prettierConfig = resolveConfig.sync(__dirname);

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

const eslintPluginRuleEntries = Object.entries(
  eslintPlugin.rules,
).sort((a, b) => a[0].localeCompare(b[0]));
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
  entry: [string, TSESLint.RuleModule<any, unknown[]>],
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
  const usedSetting = settings.errorLevel
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
  config[ruleName] = usedSetting;

  return config;
}

/**
 * Helper function writes configuration.
 */
function writeConfig(config: LinterConfig, filePath: string): void {
  const configStr = format(JSON.stringify(config), {
    parser: 'json',
    ...prettierConfig,
  });
  fs.writeFileSync(filePath, configStr);
}

const additionalTypeScriptRules: LinterConfigRules = {
  // ORIGINAL tslint.json -> "array-type": false,
  '@typescript-eslint/array-type': 'off',

  // ORIGINAL tslint.json -> "arrow-parens": false,
  'arrow-parens': 'off',

  // ORIGINAL tslint.json -> "deprecation": { "severity": "warning" },
  /**
   * | [`deprecation`]              | 🌓  | [`import/no-deprecated`] <sup>[1]</sup>            |
   * <sup>[1]</sup> Only warns when importing deprecated symbols<br>
   */

  // ORIGINAL tslint.json -> "import-blacklist": [true, "rxjs/Rx"],
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: 'rxjs/Rx',
          message: "Please import directly from 'rxjs' instead",
        },
      ],
    },
  ],

  // ORIGINAL tslint.json -> "interface-name": false,
  '@typescript-eslint/interface-name-prefix': 'off',

  // ORIGINAL tslint.json -> "max-classes-per-file": false,
  'max-classes-per-file': 'off',

  // ORIGINAL tslint.json -> "max-line-length": [true, 140],
  'max-len': ['error', { code: 140 }],

  // ORIGINAL tslint.json -> "member-access": false,
  '@typescript-eslint/explicit-member-accessibility': 'off',

  // ORIGINAL tslint.json -> "member-ordering": [true, { "order": ["static-field", "instance-field", "static-method", "instance-method"] } ],
  '@typescript-eslint/member-ordering': [
    'error',
    {
      default: [
        'static-field',
        'instance-field',
        'static-method',
        'instance-method',
      ],
    },
  ],

  // ORIGINAL tslint.json -> "no-consecutive-blank-lines": false,
  'no-multiple-empty-lines': 'off',

  // ORIGINAL tslint.json -> "no-console": [true, "debug", "info", "time", "timeEnd", "trace"],
  'no-restricted-syntax': [
    'error',
    {
      selector:
        'CallExpression[callee.object.name="console"][callee.property.name=/^(debug|info|time|timeEnd|trace)$/]',
      message: 'Unexpected property on console object was called',
    },
  ],

  // ORIGINAL tslint.json -> "no-empty": false,
  'no-empty': 'off',

  // ORIGINAL tslint.json -> "no-inferrable-types": [true, "ignore-params"],
  '@typescript-eslint/no-inferrable-types': [
    'error',
    {
      ignoreParameters: true,
    },
  ],

  // ORIGINAL tslint.json -> "no-non-null-assertion": true,
  '@typescript-eslint/no-non-null-assertion': 'error',

  // ORIGINAL tslint.json -> "no-redundant-jsdoc": true,
  /**
   * | [`no-redundant-jsdoc`]              | 🛑  | N/A ([open issue](https://github.com/gajus/eslint-plugin-jsdoc/issues/134))         |
   */

  // ORIGINAL tslint.json -> "no-switch-case-fall-through": true,
  'no-fallthrough': 'error',

  // ORIGINAL tslint.json -> "no-var-requires": false,
  '@typescript-eslint/no-var-requires': 'off',

  // ORIGINAL tslint.json -> "object-literal-key-quotes": [true, "as-needed"],
  'quote-props': ['error', 'as-needed'],

  // ORIGINAL tslint.json -> "object-literal-sort-keys": false,
  'sort-keys': 'off',

  // ORIGINAL tslint.json -> "ordered-imports": false,
  /**
   * Needs import plugin
   */

  // ORIGINAL tslint.json -> "quotemark": [true, "single"],
  quotes: ['error', 'single', { allowTemplateLiterals: true }],

  // ORIGINAL tslint.json -> "trailing-comma": false,
  'comma-dangle': 'off',
};

console.log();
console.log(
  '------------------------------------------------ eslint-plugin/base.json ------------------------------------------------',
);

const baseConfig: LinterConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', '@angular-eslint'],
  // extends: [
  //   'eslint:recommended',
  //   'plugin:@typescript-eslint/eslint-recommended',
  //   'plugin:@typescript-eslint/recommended',
  //   'plugin:@typescript-eslint/recommended-requiring-type-checking',
  // ],
};
writeConfig(
  baseConfig,
  path.resolve(__dirname, '../../packages/eslint-plugin/src/configs/base.json'),
);

console.log();
console.log(
  '------------------------------------------------ eslint-plugin/all.json ------------------------------------------------',
);
const allConfig: LinterConfig = {
  extends: './configs/base.json',
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
  path.resolve(__dirname, '../../packages/eslint-plugin/src/configs/all.json'),
);

console.log();
console.log(
  '------------------------------ eslint-plugin/recommended.json ------------------------------',
);

const recommendedConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: {
    ...additionalTypeScriptRules,
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
  '------------------------------------------------ eslint-plugin-template/base.json ------------------------------------------------',
);

const baseTemplateConfig: LinterConfig = {
  parser: '@angular-eslint/template-parser',
  plugins: ['@angular-eslint/template'],
};
writeConfig(
  baseTemplateConfig,
  path.resolve(
    __dirname,
    '../../packages/eslint-plugin-template/src/configs/base.json',
  ),
);

console.log();
console.log(
  '------------------------------------------------ eslint-plugin-template/all.json ------------------------------------------------',
);
const allTemplateConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: eslintPluginTemplateRuleEntries.reduce<LinterConfigRules>(
    (config, entry) =>
      reducer('@angular-eslint/template/', config, entry, {
        errorLevel: 'error',
        filterDeprecated: true,
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
  extends: './configs/base.json',
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
