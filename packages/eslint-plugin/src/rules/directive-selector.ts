import {
  arrayify,
  ASTUtils,
  Selectors,
  SelectorUtils,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = SelectorUtils.Options;
export type MessageIds = 'prefixFailure' | 'styleFailure' | 'typeFailure';
export const RULE_NAME = 'directive-selector';

const STYLE_GUIDE_LINK =
  'https://angular.dev/style-guide#choosing-directive-selectors';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Directive selectors should follow given naming rules. See more at ${STYLE_GUIDE_LINK}.`,
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
                  type: 'string',
                  enum: [
                    SelectorUtils.OPTION_TYPE_ELEMENT,
                    SelectorUtils.OPTION_TYPE_ATTRIBUTE,
                  ],
                },
              },
            ],
          },
          prefix: {
            oneOf: [{ type: 'string' }, { type: 'array' }],
          },
          style: {
            type: 'string',
            enum: [
              ASTUtils.OPTION_STYLE_CAMEL_CASE,
              ASTUtils.OPTION_STYLE_KEBAB_CASE,
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      prefixFailure: `The selector should start with one of these prefixes: {{prefix}} (${STYLE_GUIDE_LINK})`,
      styleFailure: `The selector should be {{style}} (${STYLE_GUIDE_LINK})`,
      typeFailure: `The selector should be used as an {{type}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      type: '',
      prefix: '',
      style: '',
    },
  ],
  create(context, [{ type, prefix, style }]) {
    return {
      [Selectors.DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawSelectors = ASTUtils.getDecoratorPropertyValue(
          node,
          'selector',
        );

        if (!rawSelectors) {
          return;
        }

        const isValidOptions = SelectorUtils.checkValidOptions(
          type,
          prefix,
          style,
        );

        if (!isValidOptions) {
          return;
        }

        const hasExpectedSelector = SelectorUtils.checkSelector(
          rawSelectors,
          type,
          arrayify<string>(prefix),
          style as ASTUtils.SelectorStyle,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        if (!hasExpectedSelector.hasExpectedType) {
          SelectorUtils.reportTypeError(rawSelectors, type, context);
        } else if (!hasExpectedSelector.hasExpectedStyle) {
          SelectorUtils.reportStyleError(rawSelectors, style, context);
        } else if (!hasExpectedSelector.hasExpectedPrefix) {
          SelectorUtils.reportPrefixError(rawSelectors, prefix, context);
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Consistent directive selector naming conventions help identify which directives belong to your application versus third-party libraries, prevent naming collisions with native HTML attributes and other directives, and make code reviews and debugging easier. For example, using a camelCase attribute selector with a prefix like 'appHighlight' makes it immediately clear that this is a custom directive from your application.",
};
