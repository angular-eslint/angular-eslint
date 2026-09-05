import {
  arrayify,
  ASTUtils,
  Selectors,
  SelectorUtils,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = readonly [
  SelectorUtils.SingleConfigOption | SelectorUtils.MultipleConfigOption,
];
export type MessageIds =
  | 'prefixFailure'
  | 'styleFailure'
  | 'typeFailure'
  | 'selectorAfterPrefixFailure';
export const RULE_NAME = 'directive-selector';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Directive selectors should follow given naming rules. See more at https://angular.dev/style-guide#choosing-directive-selectors.',
    },
    schema: [
      {
        oneOf: [
          // Single config object
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
            required: ['type', 'style'],
            additionalProperties: false,
          },
          // Array of 1-2 config objects
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: [
                    SelectorUtils.OPTION_TYPE_ELEMENT,
                    SelectorUtils.OPTION_TYPE_ATTRIBUTE,
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
              required: ['type', 'style'],
            },
            minItems: 1,
            maxItems: 2,
          },
        ],
      },
    ],
    messages: {
      prefixFailure:
        'The selector should start with one of these prefixes: {{prefix}}',
      styleFailure: 'The selector should be {{style}}',
      typeFailure: 'The selector should be used as an {{type}}',
      selectorAfterPrefixFailure: `There should be a selector after the {{prefix}} prefix`,
    },
  },
  defaultOptions: [
    {
      type: undefined as unknown as string,
      prefix: 'app', // Match default Angular CLI prefix
      style: undefined as unknown as string,
    },
  ],
  create(context, [options]) {
    // Options are required by schema, so if undefined, ESLint will throw an error
    if (!options) {
      return {};
    }
    // Normalize options to a consistent format using shared utility
    const configByType = SelectorUtils.normalizeOptionsToConfigs(options);

    return {
      [Selectors.DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawSelectors = ASTUtils.getDecoratorPropertyValue(
          node,
          'selector',
        );
        if (!rawSelectors) {
          return;
        }

        // Parse selectors once for reuse
        const parsedSelectors = SelectorUtils.parseSelectorNode(rawSelectors);
        if (!parsedSelectors || parsedSelectors.length === 0) {
          return;
        }

        const applicableConfig = SelectorUtils.getApplicableConfig(
          rawSelectors,
          configByType,
        );
        if (!applicableConfig) {
          return;
        }

        const { type, prefix, style } = applicableConfig;

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
          prefix,
          style as ASTUtils.SelectorStyle,
          parsedSelectors,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        // Directive-specific validation logic (simpler than component)
        if (!hasExpectedSelector.hasExpectedType) {
          SelectorUtils.reportTypeError(rawSelectors, type, context);
        } else if (!hasExpectedSelector.hasSelectorAfterPrefix) {
          // Only report selector after prefix error if prefix is actually required
          if (prefix !== undefined) {
            SelectorUtils.reportSelectorAfterPrefixError(
              rawSelectors,
              prefix,
              context,
            );
          }
        } else if (!hasExpectedSelector.hasExpectedStyle) {
          SelectorUtils.reportStyleError(rawSelectors, style, context);
        } else if (!hasExpectedSelector.hasExpectedPrefix) {
          // Only report prefix error if prefix is actually required (not empty)
          if (prefix !== undefined) {
            const prefixArray = arrayify<string>(prefix);
            if (prefixArray.length > 0) {
              SelectorUtils.reportPrefixError(rawSelectors, prefix, context);
            }
          }
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Consistent directive selector naming conventions help identify which directives belong to your application versus third-party libraries, prevent naming collisions with native HTML attributes and other directives, and make code reviews and debugging easier. For example, using a camelCase attribute selector with a prefix like 'appHighlight' makes it immediately clear that this is a custom directive from your application.",
};
