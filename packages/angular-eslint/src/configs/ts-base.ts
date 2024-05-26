import type { TSESLint } from '@typescript-eslint/utils';

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.Config => ({
  name: 'angular-eslint/ts-base',
  languageOptions: {
    parser,
    sourceType: 'module',
  },
  plugins: {
    '@angular-eslint': plugin,
  },
});
