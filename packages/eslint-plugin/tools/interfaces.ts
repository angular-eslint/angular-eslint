export interface CodelyzerRule {
  ruleName: string;
  type: 'style' | 'maintainability' | 'functionality';
}

export interface GithubPullRequest {
  url: string;
  title: string;
  state: string;
  number: number;
}

export interface PRDetails {
  url: string;
  title: string;
  state: string;
  number: number;
}

export interface RuleDetails {
  name: string;
  type: CodelyzerRule['type'];
  done: boolean;
  pr: PRDetails | undefined;
}
