// @ts-check

const nx = require('@nx/eslint-plugin');
const validRulePlugin = require('./tools/valid-rule-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/cases.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Property[key.name='only'][value.value=true], Property[key.name='skip'][value.value=true]",
          message:
            'Do not commit test cases with `only: true` or `skip: true`. These should only be used for local development.',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'valid-rule': validRulePlugin,
    },
    rules: {
      'valid-rule/require-rule-docs-extension': 'error',
    },
  },
];
