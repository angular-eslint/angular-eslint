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
import accessibilityElementsContent, {
  RULE_NAME as accessibilityElementsContentRuleName,
} from './rules/accessibility-elements-content';
import noDistractingElements, {
  RULE_NAME as noDistractingElementsRuleName,
} from './rules/no-distracting-elements';
import i18n, { RULE_NAME as i18nRuleName } from './rules/i18n';
import mouseEventsHaveKeyEvents, {
  RULE_NAME as mouseEventsHaveKeyEventsRuleName,
} from './rules/mouse-events-have-key-events-rule';
import accessibilityAltText, {
  RULE_NAME as accessibilityAltTextRuleName,
} from './rules/accessibility-alt-text';
import accessibilityValidAria, {
  RULE_NAME as accessibilityValidAriaRuleName,
} from './rules/accessibility-valid-aria';
import accessibilityTableScope, {
  RULE_NAME as accessibilityTableScopeRuleName,
} from './rules/accessibility-table-scope';
import conditionalСomplexity, {
  RULE_NAME as conditionalСomplexityRuleName,
} from './rules/conditional-complexity';

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
    [accessibilityElementsContentRuleName]: accessibilityElementsContent,
    [noDistractingElementsRuleName]: noDistractingElements,
    [i18nRuleName]: i18n,
    [mouseEventsHaveKeyEventsRuleName]: mouseEventsHaveKeyEvents,
    [accessibilityAltTextRuleName]: accessibilityAltText,
    [accessibilityValidAriaRuleName]: accessibilityValidAria,
    [accessibilityTableScopeRuleName]: accessibilityTableScope,
    [conditionalСomplexityRuleName]: conditionalСomplexity,
  },
};
