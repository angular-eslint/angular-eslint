import { CssSelector } from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { SelectorStyle } from './ast-utils';
import {
  isLiteral,
  isTemplateLiteral,
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
} from './ast-utils';
import { arrayify, toHumanReadableText } from '../utils';

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
    readonly type: SelectorTypeOption | readonly SelectorTypeOption[];
    readonly prefix: string | readonly string[];
    readonly style: SelectorTypeOption;
  },
];

export const SelectorValidator = {
  attribute(selector: string): boolean {
    return selector.length !== 0;
  },

  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9[\]]+$/.test(selector);
  },

  element(selector: string): boolean {
    return selector !== null;
  },

  kebabCase(selector: string): boolean {
    return /^[a-z0-9-]+-[a-z0-9-]+$/.test(selector);
  },

  prefix(
    prefix: string,
    selectorStyle: SelectorStyle,
  ): (selector: string) => boolean {
    const regex = new RegExp(`^\\[?(${prefix})`);

    return (selector) => {
      if (!prefix) return true;

      if (!regex.test(selector)) return false;

      const suffix = selector.replace(regex, '');

      if (selectorStyle === OPTION_STYLE_CAMEL_CASE) {
        return !suffix || suffix[0] === suffix[0].toUpperCase();
      } else if (selectorStyle === OPTION_STYLE_KEBAB_CASE) {
        return !suffix || suffix[0] === '-';
      }

      throw Error('Invalid selector style!');
    };
  },
};

const getValidSelectors = (
  selectors: readonly CssSelector[],
  types: readonly SelectorTypeInternal[],
): readonly string[] => {
  return selectors.reduce<readonly string[]>((previousValue, currentValue) => {
    const validSelectors = types.reduce<readonly string[]>(
      (accumulator, type) => {
        const value = currentValue[type];
        return value ? accumulator.concat(value) : accumulator;
      },
      [],
    );

    return previousValue.concat(validSelectors);
  }, []);
};

export const reportPrefixError = (
  node: TSESTree.Node,
  prefix: string | readonly string[],
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void => {
  context.report({
    node,
    messageId: 'prefixFailure',
    data: {
      prefix: toHumanReadableText(arrayify(prefix)),
    },
  });
};

export const reportStyleError = (
  node: TSESTree.Node,
  style: SelectorStyleOption,
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void => {
  context.report({
    node,
    messageId: 'styleFailure',
    data: {
      style,
    },
  });
};

export const reportTypeError = (
  node: TSESTree.Node,
  type: SelectorTypeOption | readonly SelectorTypeOption[],
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void => {
  context.report({
    node,
    messageId: 'typeFailure',
    data: {
      type,
    },
  });
};

export const checkValidOptions = (
  type: SelectorTypeOption | readonly SelectorTypeOption[],
  prefix: string | readonly string[],
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
  node: TSESTree.Node,
  typeOption: SelectorTypeOption | readonly SelectorTypeOption[],
  prefixOption: readonly string[],
  styleOption: SelectorStyle,
): {
  readonly hasExpectedPrefix: boolean;
  readonly hasExpectedType: boolean;
  readonly hasExpectedStyle: boolean;
} | null => {
  // Get valid list of selectors
  const types = arrayify<SelectorTypeOption>(
    typeOption || [OPTION_TYPE_ATTRS, OPTION_TYPE_ELEMENT],
  ).reduce<readonly SelectorTypeInternal[]>(
    (previousValue, currentValue) =>
      previousValue.concat(SELECTOR_TYPE_MAPPER[currentValue]),
    [],
  );

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
