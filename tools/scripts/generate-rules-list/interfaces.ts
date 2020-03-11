/**
 * @description
 * Represents a CodelyzerRule.
 */
export interface CodelyzerRule {
  ruleName: string;
  type: 'style' | 'maintainability' | 'functionality';
}

/**
 * @description
 * Represents a subset of Pull Request details pulled from the GitHub PR api.
 */
export interface PRDetails {
  url: string;
  title: string;
  state: string;
  number: number;
}

/**
 * @description
 * Represents status details for a ESLint Rule.
 */
export interface RuleDetails {
  name: string;
  type: CodelyzerRule['type'];
  done: boolean;
  pr: PRDetails | undefined;
}
