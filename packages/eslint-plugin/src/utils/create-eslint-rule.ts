import { ESLintUtils } from '@typescript-eslint/utils';

export interface RuleDocs {
  recommended?: string;
}

export const createESLintRule = ESLintUtils.RuleCreator<RuleDocs>(
  (ruleName) =>
    `https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/${ruleName}.md`,
);
