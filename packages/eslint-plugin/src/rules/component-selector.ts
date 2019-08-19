import { TSESTree } from '@typescript-eslint/experimental-utils';
import { CssSelector } from '@angular/compiler';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import {
  arrayify,
  getDecoratorPropertyValue,
  isLiteral,
  isNotNullOrUndefined,
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
  SelectorStyle,
  SelectorValidator,
} from '../utils/utils';
const NONE = 'None';
type Options = [
  {
    type: string | Array<string>;
    prefix: string | Array<string>;
    style: string;
  }
];
export type MessageIds = 'prefixFailure' | 'styleFailure' | 'typeFailure';
export const RULE_NAME = 'component-selector';

const STYLE_GUIDE_PREFIX_LINK =
  'https://angular.io/guide/styleguide#style-02-07';
const STYLE_GUIDE_STYLE_LINK =
  'https://angular.io/guide/styleguide#style-05-02';
const STYLE_GUIDE_TYPE_LINK = 'https://angular.io/guide/styleguide#style-05-03';

export const OPTION_TYPE_ATTRIBUTE = 'attribute';
export const OPTION_TYPE_ATTRS = 'attrs';
export const OPTION_TYPE_ELEMENT = 'element';

export type SelectorType =
  | typeof OPTION_TYPE_ATTRIBUTE
  | typeof OPTION_TYPE_ELEMENT
  | string;
export type SelectorTypeInternal =
  | typeof OPTION_TYPE_ATTRS
  | typeof OPTION_TYPE_ELEMENT;

const SELECTOR_TYPE_MAPPER: Record<SelectorType, SelectorTypeInternal> = {
  [OPTION_TYPE_ATTRIBUTE]: OPTION_TYPE_ATTRS,
  [OPTION_TYPE_ELEMENT]: OPTION_TYPE_ELEMENT,
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Component selectors should follow given naming rules. See more at ${STYLE_GUIDE_PREFIX_LINK}, ${STYLE_GUIDE_STYLE_LINK}
      and ${STYLE_GUIDE_TYPE_LINK}.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          type: {
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: {
                  enum: [OPTION_TYPE_ELEMENT, OPTION_TYPE_ATTRIBUTE],
                },
              },
            ],
          },
          prefix: {
            oneOf: [{ type: 'string' }, { type: 'array' }],
          },
          style: {
            type: 'string',
            enum: [OPTION_STYLE_CAMEL_CASE, OPTION_STYLE_KEBAB_CASE],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      prefixFailure: `The selector should be prefixed by one of the prefixes: '{{prefix}}' (${STYLE_GUIDE_PREFIX_LINK})`,
      styleFailure: `The selector should be {{style}} (${STYLE_GUIDE_STYLE_LINK})`,
      typeFailure: `The selector should be used as an {{type}} (${STYLE_GUIDE_TYPE_LINK})`,
    },
  },
  defaultOptions: [
    {
      type: '',
      prefix: '',
      style: '',
    },
  ],
  create(context, [options]) {
    const { type, prefix, style } = options;

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

    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawSelectors = getDecoratorPropertyValue(node, 'selector');
        if (
          rawSelectors &&
          (isLiteral(rawSelectors) && rawSelectors.raw !== NONE)
        ) {
          // Get valid list of selectors
          const types: SelectorTypeInternal[] = arrayify<SelectorType>(
            type || [OPTION_TYPE_ATTRS, OPTION_TYPE_ELEMENT],
          ).reduce<Array<SelectorTypeInternal>>(
            (previousValue, currentValue) =>
              previousValue.concat(SELECTOR_TYPE_MAPPER[currentValue]),
            [],
          );
          const listSelectors = CssSelector.parse(rawSelectors.raw);
          const validSelectors = getValidSelectors(listSelectors, types);

          // Get options
          const typeOption = arrayify<SelectorType>(type);
          const prefixOption = arrayify<string>(prefix).filter(
            isNotNullOrUndefined,
          );
          const styleOption = style as SelectorStyle;

          // Check if options are valid
          const isTypeOptionValid =
            typeOption.length > 0 &&
            typeOption.every(
              argument =>
                [OPTION_TYPE_ELEMENT, OPTION_TYPE_ATTRIBUTE].indexOf(
                  argument,
                ) !== -1,
            );

          const isPrefixOptionValid = prefix.length > 0;

          const isStyleOptionValid =
            [OPTION_STYLE_CAMEL_CASE, OPTION_STYLE_KEBAB_CASE].indexOf(
              styleOption,
            ) !== -1;

          if (isTypeOptionValid && isPrefixOptionValid && isStyleOptionValid) {
            const styleValidator =
              styleOption === OPTION_STYLE_KEBAB_CASE
                ? SelectorValidator.kebabCase
                : SelectorValidator.camelCase;

            const isValidPrefixe = arrayify<string>(
              rawSelectors.value as string,
            ).some(selector =>
              prefixOption.some(prefix =>
                SelectorValidator.prefix(prefix, styleOption)(selector),
              ),
            );
            const isValidStyle = validSelectors.some(selector =>
              styleValidator(selector),
            );

            const isValidType = listSelectors.length > 0;

            if (!isValidType) {
              context.report({
                node: rawSelectors,
                messageId: 'typeFailure',
                data: {
                  type,
                },
              });
            } else if (!isValidStyle) {
              context.report({
                node: rawSelectors,
                messageId: 'styleFailure',
                data: {
                  style,
                },
              });
            } else if (!isValidPrefixe) {
              context.report({
                node: rawSelectors,
                messageId: 'prefixFailure',
                data: {
                  prefix,
                },
              });
            }
          }
        }
      },
    };
  },
});
