import type { TSESLint } from '@typescript-eslint/utils';

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.Config => ({
  name: 'angular-eslint/template-base',
  languageOptions: {
    parser,
  },
  plugins: {
    '@angular-eslint/template': plugin,
  },
});
