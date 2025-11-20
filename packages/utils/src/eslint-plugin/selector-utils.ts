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

// Shared type definitions for selector rules
export type SelectorConfig = {
  readonly type: SelectorTypeOption;
  readonly prefix: string | readonly string[];
  readonly style: SelectorStyleOption;
};

export type SingleConfigOption = Options[number];
export type MultipleConfigOption = readonly SelectorConfig[];
export type RuleOptions = readonly [SingleConfigOption | MultipleConfigOption];

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

  prefixRegex(prefix: string): RegExp {
    return new RegExp(`^\\[?(${prefix})`);
  },

  prefix(prefix: string, selectorStyle: string): (selector: string) => boolean {
    const regex = this.prefixRegex(prefix);

    return (selector) => {
      if (!prefix) return true;

      if (!regex.test(selector)) return false;

      const selectorAfterPrefix = selector.replace(regex, '');

      if (selectorStyle === OPTION_STYLE_CAMEL_CASE) {
        return (
          !selectorAfterPrefix ||
          selectorAfterPrefix[0] === selectorAfterPrefix[0].toUpperCase()
        );
      } else if (selectorStyle === OPTION_STYLE_KEBAB_CASE) {
        return !selectorAfterPrefix || selectorAfterPrefix[0] === '-';
      }

      throw Error('Invalid selector style!');
    };
  },

  selectorAfterPrefix(prefix: string): (selector: string) => boolean {
    const regex = this.prefixRegex(prefix);

    return (selector) => {
      const selectorAfterPrefix = selector.replace(regex, '');

      return Boolean(selectorAfterPrefix);
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

export const reportSelectorAfterPrefixError = (
  node: TSESTree.Node,
  prefix: string | readonly string[],
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void => {
  context.report({
    node,
    messageId: 'selectorAfterPrefixFailure',
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

export const reportStyleAndPrefixError = (
  node: TSESTree.Node,
  style: SelectorStyleOption,
  prefix: string | readonly string[],
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void => {
  context.report({
    node,
    messageId: 'styleAndPrefixFailure',
    data: {
      style,
      prefix: toHumanReadableText(arrayify(prefix)),
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

export const parseSelectorNode = (
  node: TSESTree.Node,
): readonly CssSelector[] | null => {
  if (isLiteral(node)) {
    return CssSelector.parse(node.raw);
  } else if (isTemplateLiteral(node) && node.quasis[0]) {
    return CssSelector.parse(node.quasis[0].value.raw);
  }
  return null;
};

export const getActualSelectorType = (
  node: TSESTree.Node,
): SelectorTypeOption | null => {
  const listSelectors = parseSelectorNode(node);

  if (!listSelectors || listSelectors.length === 0) {
    return null;
  }

  // Check the first selector to determine type
  const firstSelector = listSelectors[0];

  // Attribute selectors have attrs populated (e.g., [appFoo])
  // CssSelector.attrs is an array where each attribute is stored as [name, value]
  if (Array.isArray(firstSelector.attrs) && firstSelector.attrs.length > 0) {
    return OPTION_TYPE_ATTRIBUTE;
  }

  // Element selectors have a non-null, non-empty element (e.g., app-foo)
  if (
    firstSelector.element != null &&
    firstSelector.element !== '' &&
    firstSelector.element !== '*'
  ) {
    return OPTION_TYPE_ELEMENT;
  }

  return null;
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
  parsedSelectors?: readonly CssSelector[] | null,
): {
  readonly hasExpectedPrefix: boolean;
  readonly hasExpectedType: boolean;
  readonly hasExpectedStyle: boolean;
  readonly hasSelectorAfterPrefix: boolean;
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

  // Use provided parsed selectors or parse them
  const listSelectors = parsedSelectors ?? parseSelectorNode(node);

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

  const hasSelectorAfterPrefix = validSelectors.some((selector) => {
    return prefixOption.some((prefix) => {
      return SelectorValidator.selectorAfterPrefix(prefix)(selector);
    });
  });

  return {
    hasExpectedPrefix,
    hasExpectedType,
    hasExpectedStyle,
    hasSelectorAfterPrefix,
  };
};

// Type guard for multiple configs
export const isMultipleConfigOption = (
  option: SingleConfigOption | MultipleConfigOption,
): option is MultipleConfigOption => {
  return (
    Array.isArray(option) &&
    option.length >= 1 &&
    option.length <= 2 &&
    option.every((config) => typeof config.type === 'string')
  );
};

// Normalize options to a consistent format
export const normalizeOptionsToConfigs = (
  option: SingleConfigOption | MultipleConfigOption,
): Map<string, SelectorConfig> => {
  const configByType = new Map<string, SelectorConfig>();

  if (isMultipleConfigOption(option)) {
    // Validate no duplicate types
    const types = option.map((config) => config.type);
    if (new Set(types).size !== types.length) {
      throw new Error(
        'Invalid rule config: Each config object in the options array must have a unique "type" property (either "element" or "attribute")',
      );
    }

    // Build lookup map by type
    for (const config of option) {
      configByType.set(config.type, config);
    }
  } else {
    // Single config - normalize to map format
    // Handle both single type and array of types
    const types = arrayify<SelectorTypeOption>(option.type);
    for (const type of types) {
      configByType.set(type, {
        type,
        prefix: option.prefix,
        style: option.style,
      });
    }
  }

  return configByType;
};

/**
 * Get the applicable config for a given selector node
 */
export const getApplicableConfig = (
  rawSelectors: TSESTree.Node,
  configByType: Map<string, SelectorConfig>,
): SelectorConfig | null => {
  // For multiple configs, determine the actual selector type
  let applicableConfig: SelectorConfig | null = null;

  if (configByType.size > 1) {
    // Multiple configs - need to determine which one applies
    const actualType = getActualSelectorType(rawSelectors);
    if (!actualType) {
      return null;
    }

    const config = configByType.get(actualType);
    if (!config) {
      // No config defined for this selector type
      return null;
    }
    applicableConfig = config;
  } else {
    // Single config or single type extracted from array
    const firstEntry = configByType.entries().next();
    if (!firstEntry.done) {
      applicableConfig = firstEntry.value[1];
    }
  }

  return applicableConfig;
};
