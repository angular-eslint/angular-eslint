import all from './configs/all.json';
import base from './configs/base.json';
import recommended from './configs/recommended.json';
import processInlineTemplates from './configs/process-inline-templates.json';
import processors from './processors';
import bananaInBox, {
  RULE_NAME as bananaInBoxRuleName,
} from './rules/banana-in-box';
import cyclomaticComplexity, {
  RULE_NAME as cyclomaticComplexityRuleName,
} from './rules/cyclomatic-complexity';
import noAutofocus, {
  RULE_NAME as noAutofocusRuleName,
} from './rules/no-autofocus';
import noCallExpression, {
  RULE_NAME as noCallExpressionRuleName,
} from './rules/no-call-expression';
import noNegatedAsync, {
  RULE_NAME as noNegatedAsyncRuleName,
} from './rules/no-negated-async';
import noPositiveTabindex, {
  RULE_NAME as noPositiveTabindexRuleName,
} from './rules/no-positive-tabindex';
import useTrackByFunction, {
  RULE_NAME as useTrackByFunctionRuleName,
} from './rules/use-track-by-function';

export default {
  configs: {
    all,
    base,
    recommended,
    'process-inline-templates': processInlineTemplates,
  },
  processors,
  rules: {
    [bananaInBoxRuleName]: bananaInBox,
    [cyclomaticComplexityRuleName]: cyclomaticComplexity,
    [noAutofocusRuleName]: noAutofocus,
    [noCallExpressionRuleName]: noCallExpression,
    [noNegatedAsyncRuleName]: noNegatedAsync,
    [noPositiveTabindexRuleName]: noPositiveTabindex,
    [useTrackByFunctionRuleName]: useTrackByFunction,
  },
};
