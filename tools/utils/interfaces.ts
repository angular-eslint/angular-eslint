/**
 * Represents a CodelyzerRule.
 */
export interface CodelyzerRule {
  ruleName: string;
  type: 'style' | 'maintainability' | 'functionality';
}

/**
 * Represents a subset of Pull Request details pulled from the GitHub PR api.
 */
export interface PRDetails {
  url: string;
  title: string;
  state: string;
  number: number;
}
