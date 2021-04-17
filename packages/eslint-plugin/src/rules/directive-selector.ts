import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { DIRECTIVE_CLASS_DECORATOR } from '../utils/selectors';
import type { SelectorStyle } from '../utils/utils';
import {
  arrayify,
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
  getDecoratorPropertyValue,
} from '../utils/utils';

import type { Options } from '../utils/property-selector';
import {
  checkSelector,
  checkValidOptions,
  reportPrefixError,
  reportTypeError,
  OPTION_TYPE_ATTRIBUTE,
  OPTION_TYPE_ELEMENT,
  reportStyleError,
} from '../utils/property-selector';

export const RULE_NAME = 'directive-selector';
export type MessageIds = 'prefixFailure' | 'styleFailure' | 'typeFailure';

const STYLE_GUIDE_PREFIX_LINK =
  'https://angular.io/guide/styleguide#style-02-08';
const STYLE_GUIDE_STYLE_TYPE_LINK =
  'https://angular.io/guide/styleguide#style-02-06';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Directive selectors should follow given naming rules. See more at ${STYLE_GUIDE_STYLE_TYPE_LINK} and ${STYLE_GUIDE_PREFIX_LINK}.`,
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
      styleFailure: `The selector should be {{style}} (${STYLE_GUIDE_STYLE_TYPE_LINK})`,
      typeFailure: `The selector should be used as an {{type}} (${STYLE_GUIDE_STYLE_TYPE_LINK})`,
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

    return {
      [DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawSelectors = getDecoratorPropertyValue(node, 'selector');

        if (!rawSelectors) {
          return;
        }

        const isValidOptions = checkValidOptions(type, prefix, style);

        if (!isValidOptions) {
          return;
        }

        const hasExpectedSelector = checkSelector(
          rawSelectors,
          type,
          arrayify<string>(prefix),
          style as SelectorStyle,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        if (!hasExpectedSelector.hasExpectedType) {
          reportTypeError(rawSelectors, type, context);
        } else if (!hasExpectedSelector.hasExpectedStyle) {
          reportStyleError(rawSelectors, style, context);
        } else if (!hasExpectedSelector.hasExpectedPrefix) {
          reportPrefixError(rawSelectors, prefix, context);
        }
      },
    };
  },
});
