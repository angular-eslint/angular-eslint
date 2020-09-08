import all from './configs/all.json';
import base from './configs/base.json';
import recommended from './configs/recommended.json';
import processInlineTemplates from './configs/process-inline-templates.json';
import processors from './processors';
import bananaInABox, {
  RULE_NAME as bananaInABoxRuleName,
} from './rules/banana-in-a-box';
import cyclomaticComplexity, {
  RULE_NAME as cyclomaticComplexityRuleName,
} from './rules/cyclomatic-complexity';
import noCallExpression, {
  RULE_NAME as noCallExpressionRule,
} from './rules/no-call-expression';
import noNegatedAsync, {
  RULE_NAME as noNegatedAsyncRuleName,
} from './rules/no-negated-async';
import noPositiveTabindex, {
  RULE_NAME as noPositiveTabindexRuleName,
} from './rules/no-positive-tabindex';

export default {
  configs: {
    all,
    base,
    recommended,
    'process-inline-templates': processInlineTemplates,
  },
  processors,
  rules: {
    [bananaInABoxRuleName]: bananaInABox,
    [cyclomaticComplexityRuleName]: cyclomaticComplexity,
    [noCallExpressionRule]: noCallExpression,
    [noNegatedAsyncRuleName]: noNegatedAsync,
    [noPositiveTabindexRuleName]: noPositiveTabindex,
  },
};
