import {
  arrayify,
  ASTUtils,
  Selectors,
  SelectorUtils,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = SelectorUtils.RuleOptions;
export type MessageIds = 'prefixFailure' | 'styleFailure' | 'typeFailure';
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
              required: ['type'],
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

        // For multiple configs, determine the actual selector type
        let applicableConfig: SelectorUtils.SelectorConfig | null = null;

        if (configByType.size > 1) {
          // Multiple configs - need to determine which one applies
          const actualType = SelectorUtils.getActualSelectorType(rawSelectors);
          if (!actualType) {
            return;
          }

          const config = configByType.get(actualType);
          if (!config) {
            // No config defined for this selector type
            return;
          }
          applicableConfig = config;
        } else {
          // Single config or single type extracted from array
          const firstEntry = configByType.entries().next();
          if (!firstEntry.done) {
            applicableConfig = firstEntry.value[1];
          }
        }

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
          arrayify<string>(prefix),
          style as ASTUtils.SelectorStyle,
          parsedSelectors,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        // Directive-specific validation logic (simpler than component)
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
