export interface Schema {
  project?: string;
  convertIndentationRules: boolean;
  removeTslintIfNoMoreTslintTargets?: boolean;
  ignoreExistingTslintConfig: boolean;
}
