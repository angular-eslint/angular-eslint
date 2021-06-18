import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const createESLintRule = ESLintUtils.RuleCreator(
  (_ruleName) => `https://github.com/angular-eslint/angular-eslint`,
);
