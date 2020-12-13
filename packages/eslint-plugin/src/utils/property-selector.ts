import { CssSelector } from '@angular/compiler';
import { TSESTree } from '@typescript-eslint/experimental-utils';

import {
  arrayify,
  isLiteral,
  isTemplateLiteral,
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
  SelectorStyle,
  SelectorValidator,
} from './utils';

export const OPTION_TYPE_ATTRIBUTE = 'attribute';
export const OPTION_TYPE_ATTRS = 'attrs';
export const OPTION_TYPE_ELEMENT = 'element';

export type SelectorStyleOption = SelectorStyle | string;
export type SelectorTypeOption =
  | typeof OPTION_TYPE_ATTRIBUTE
  | typeof OPTION_TYPE_ELEMENT
  | string;
export type SelectorTypeInternal =
  | typeof OPTION_TYPE_ATTRS
  | typeof OPTION_TYPE_ELEMENT;

const SELECTOR_TYPE_MAPPER: Record<string, SelectorTypeInternal> = {
  [OPTION_TYPE_ATTRIBUTE]: OPTION_TYPE_ATTRS,
  [OPTION_TYPE_ELEMENT]: OPTION_TYPE_ELEMENT,
};

export type Options = [
  {
    type: SelectorTypeOption | Array<SelectorTypeOption>;
    prefix: string | Array<string>;
    style: SelectorTypeOption;
  },
];

const getValidSelectors = (
  selectors: CssSelector[],
  types: SelectorTypeInternal[],
): ReadonlyArray<string> => {
  return selectors.reduce<ReadonlyArray<string>>(
    (previousValue, currentValue) => {
      const validSelectors = types.reduce<ReadonlyArray<string>>(
        (accumulator, type) => {
          const value = currentValue[type];
          return value ? accumulator.concat(value) : accumulator;
        },
        [],
      );

      return previousValue.concat(validSelectors);
    },
    [],
  );
};

export const reportPrefixError = (
  node: TSESTree.Expression | TSESTree.Literal,
  prefix: string | Array<string>,
  context: any,
) => {
  context.report({
    node: node,
    messageId: 'prefixFailure',
    data: {
      prefix,
    },
  });
};

export const reportStyleError = (
  node: TSESTree.Expression | TSESTree.Literal,
  style: SelectorStyleOption,
  context: any,
) => {
  context.report({
    node: node,
    messageId: 'styleFailure',
    data: {
      style,
    },
  });
};

export const reportTypeError = (
  node: TSESTree.Expression | TSESTree.Literal,
  type: SelectorTypeOption | Array<SelectorTypeOption>,
  context: any,
) => {
  context.report({
    node: node,
    messageId: 'typeFailure',
    data: {
      type,
    },
  });
};

export const checkValidOptions = (
  type: SelectorTypeOption | Array<SelectorTypeOption>,
  prefix: string | Array<string>,
  style: SelectorStyleOption,
): boolean => {
  // Get options
  const typeOption = arrayify<SelectorTypeOption>(type);

  const styleOption = style as SelectorStyle;

  // Check if options are valid
  const isTypeOptionValid =
    typeOption.length > 0 &&
    typeOption.every(
      (argument) =>
        [OPTION_TYPE_ELEMENT, OPTION_TYPE_ATTRIBUTE].indexOf(argument) !== -1,
    );

  const isPrefixOptionValid = prefix.length > 0;

  const isStyleOptionValid =
    [OPTION_STYLE_CAMEL_CASE, OPTION_STYLE_KEBAB_CASE].indexOf(styleOption) !==
    -1;

  return isTypeOptionValid && isPrefixOptionValid && isStyleOptionValid;
};

export const checkSelector = (
  node: TSESTree.Expression | TSESTree.Literal,
  type: SelectorTypeOption | Array<SelectorTypeOption>,
  prefixOption: Array<string>,
  styleOption: SelectorStyle,
) => {
  // Get valid list of selectors
  const types: SelectorTypeInternal[] = arrayify<SelectorTypeOption>(
    type || [OPTION_TYPE_ATTRS, OPTION_TYPE_ELEMENT],
  ).reduce<Array<SelectorTypeInternal>>(
    (previousValue, currentValue) =>
      previousValue.concat(SELECTOR_TYPE_MAPPER[currentValue]),
    [],
  );

  //  if (isTypeOptionValid && isPrefixOptionValid && isStyleOptionValid) {
  const styleValidator =
    styleOption === OPTION_STYLE_KEBAB_CASE
      ? SelectorValidator.kebabCase
      : SelectorValidator.camelCase;

  let listSelectors = null;

  if (node && isLiteral(node)) {
    listSelectors = CssSelector.parse(node.raw);
  } else if (node && isTemplateLiteral(node) && node.quasis[0]) {
    listSelectors = CssSelector.parse(node.quasis[0].value.raw);
  }

  if (!listSelectors) {
    return null;
  }

  const validSelectors = getValidSelectors(listSelectors, types);

  const hasExpectedPrefix = validSelectors.some((selector) =>
    prefixOption.some((prefix) =>
      SelectorValidator.prefix(prefix, styleOption)(selector),
    ),
  );

  const hasExpectedStyle = validSelectors.some((selector) =>
    styleValidator(selector),
  );

  const hasExpectedType = validSelectors.length > 0;

  return {
    hasExpectedPrefix,
    hasExpectedType,
    hasExpectedStyle,
  };
};
