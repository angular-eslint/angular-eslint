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
import i18n, { RULE_NAME as i18nRuleName } from './rules/i18n';

export default {
  processors,
  rules: {
    [bananaInABoxRuleName]: bananaInABox,
    [cyclomaticComplexityRuleName]: cyclomaticComplexity,
    [noCallExpressionRule]: noCallExpression,
    [noNegatedAsyncRuleName]: noNegatedAsync,
    [i18nRuleName]: i18n,
  },
};
