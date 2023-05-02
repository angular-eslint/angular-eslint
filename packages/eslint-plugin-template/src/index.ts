import accessibility from './configs/accessibility.json';
import all from './configs/all.json';
import processInlineTemplates from './configs/process-inline-templates.json';
import recommended from './configs/recommended.json';
import processors from './processors';
import accessibilityLabelFor, {
  RULE_NAME as accessibilityLabelForRuleName,
} from './rules/accessibility-label-for';
import altText, { RULE_NAME as altTextRuleName } from './rules/alt-text';
import attributesOrder, {
  RULE_NAME as attributesOrderRuleName,
} from './rules/attributes-order';
import bananaInBox, {
  RULE_NAME as bananaInBoxRuleName,
} from './rules/banana-in-box';
import buttonHasType, {
  RULE_NAME as buttonHasTypeRuleName,
} from './rules/button-has-type';
import clickEventsHaveKeyEvents, {
  RULE_NAME as clickEventsHaveKeyEventsRuleName,
} from './rules/click-events-have-key-events';
import conditionalComplexity, {
  RULE_NAME as conditionalComplexityRuleName,
} from './rules/conditional-complexity';
import cyclomaticComplexity, {
  RULE_NAME as cyclomaticComplexityRuleName,
} from './rules/cyclomatic-complexity';
import elementsContent, {
  RULE_NAME as elementsContentRuleName,
} from './rules/elements-content';
import eqeqeq, { RULE_NAME as eqeqeqRuleName } from './rules/eqeqeq';
import i18n, { RULE_NAME as i18nRuleName } from './rules/i18n';
import interactiveSupportsFocus, {
  RULE_NAME as interactiveSupportsFocusRuleName,
} from './rules/interactive-supports-focus';
import labelHasAssociatedControl, {
  RULE_NAME as labelHasAssociatedControlRuleName,
} from './rules/label-has-associated-control';
import mouseEventsHaveKeyEvents, {
  RULE_NAME as mouseEventsHaveKeyEventsRuleName,
} from './rules/mouse-events-have-key-events';
import noAny, { RULE_NAME as noAnyRuleName } from './rules/no-any';
import noAutofocus, {
  RULE_NAME as noAutofocusRuleName,
} from './rules/no-autofocus';
import noCallExpression, {
  RULE_NAME as noCallExpressionRuleName,
} from './rules/no-call-expression';
import noDistractingElements, {
  RULE_NAME as noDistractingElementsRuleName,
} from './rules/no-distracting-elements';
import noDuplicateAttributes, {
  RULE_NAME as noDuplicateAttributesRuleName,
} from './rules/no-duplicate-attributes';
import noInlineStyles, {
  RULE_NAME as noInlineStylesRuleName,
} from './rules/no-inline-styles';
import noInterpolationInAttributes, {
  RULE_NAME as noInterpolationInAttributesRuleName,
} from './rules/no-interpolation-in-attributes';
import noNegatedAsync, {
  RULE_NAME as noNegatedAsyncRuleName,
} from './rules/no-negated-async';
import noPositiveTabindex, {
  RULE_NAME as noPositiveTabindexRuleName,
} from './rules/no-positive-tabindex';
import roleHasRequiredAria, {
  RULE_NAME as roleHasRequiredAriaRuleName,
} from './rules/role-has-required-aria';
import tableScope, {
  RULE_NAME as tableScopeRuleName,
} from './rules/table-scope';
import useTrackByFunction, {
  RULE_NAME as useTrackByFunctionRuleName,
} from './rules/use-track-by-function';
import validAria, { RULE_NAME as validAriaRuleName } from './rules/valid-aria';

export = {
  configs: {
    all,
    recommended,
    accessibility,
    'process-inline-templates': processInlineTemplates,
  },
  processors,
  rules: {
    [accessibilityLabelForRuleName]: accessibilityLabelFor,
    [altTextRuleName]: altText,
    [attributesOrderRuleName]: attributesOrder,
    [bananaInBoxRuleName]: bananaInBox,
    [buttonHasTypeRuleName]: buttonHasType,
    [clickEventsHaveKeyEventsRuleName]: clickEventsHaveKeyEvents,
    [conditionalComplexityRuleName]: conditionalComplexity,
    [cyclomaticComplexityRuleName]: cyclomaticComplexity,
    [elementsContentRuleName]: elementsContent,
    [eqeqeqRuleName]: eqeqeq,
    [i18nRuleName]: i18n,
    [interactiveSupportsFocusRuleName]: interactiveSupportsFocus,
    [labelHasAssociatedControlRuleName]: labelHasAssociatedControl,
    [mouseEventsHaveKeyEventsRuleName]: mouseEventsHaveKeyEvents,
    [noAnyRuleName]: noAny,
    [noAutofocusRuleName]: noAutofocus,
    [noCallExpressionRuleName]: noCallExpression,
    [noDistractingElementsRuleName]: noDistractingElements,
    [noDuplicateAttributesRuleName]: noDuplicateAttributes,
    [noInlineStylesRuleName]: noInlineStyles,
    [noInterpolationInAttributesRuleName]: noInterpolationInAttributes,
    [noNegatedAsyncRuleName]: noNegatedAsync,
    [noPositiveTabindexRuleName]: noPositiveTabindex,
    [roleHasRequiredAriaRuleName]: roleHasRequiredAria,
    [tableScopeRuleName]: tableScope,
    [useTrackByFunctionRuleName]: useTrackByFunction,
    [validAriaRuleName]: validAria,
  },
};
