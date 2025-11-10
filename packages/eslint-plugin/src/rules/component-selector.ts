import {
  arrayify,
  ASTUtils,
  Selectors,
  SelectorUtils,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = SelectorUtils.RuleOptions;
export type MessageIds =
  | 'prefixFailure'
  | 'styleFailure'
  | 'styleAndPrefixFailure'
  | 'typeFailure'
  | 'shadowDomEncapsulatedStyleFailure';
export const RULE_NAME = 'component-selector';

const VIEW_ENCAPSULATION_SHADOW_DOM = 'ShadowDom';
const VIEW_ENCAPSULATION = 'ViewEncapsulation';
const STYLE_GUIDE_LINK =
  'https://angular.dev/style-guide#choosing-component-selectors';
const SHADOW_DOM_ENCAPSULATED_STYLE_LINK =
  'https://github.com/angular-eslint/angular-eslint/issues/534';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Component selectors should follow given naming rules. See more at ${STYLE_GUIDE_LINK}.`,
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
      prefixFailure: `The selector should start with one of these prefixes: {{prefix}} (${STYLE_GUIDE_LINK})`,
      styleFailure: `The selector should be {{style}} (${STYLE_GUIDE_LINK})`,
      styleAndPrefixFailure: `The selector should be {{style}} and start with one of these prefixes: {{prefix}} (${STYLE_GUIDE_LINK} and ${STYLE_GUIDE_LINK})`,
      typeFailure: `The selector should be used as an {{type}} (${STYLE_GUIDE_LINK})`,
      shadowDomEncapsulatedStyleFailure: `The selector of a ShadowDom-encapsulated component should be \`${ASTUtils.OPTION_STYLE_KEBAB_CASE}\` (${SHADOW_DOM_ENCAPSULATED_STYLE_LINK})`,
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
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
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

        // Override `style` for ShadowDom-encapsulated components. See https://github.com/angular-eslint/angular-eslint/issues/534.
        const overrideStyle =
          style !== ASTUtils.OPTION_STYLE_KEBAB_CASE &&
          hasEncapsulationShadowDomProperty(node)
            ? ASTUtils.OPTION_STYLE_KEBAB_CASE
            : style;

        const hasExpectedSelector = SelectorUtils.checkSelector(
          rawSelectors,
          type,
          arrayify<string>(prefix),
          overrideStyle as ASTUtils.SelectorStyle,
          parsedSelectors,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        // Component-specific validation logic (includes styleAndPrefixFailure)
        if (!hasExpectedSelector.hasExpectedType) {
          SelectorUtils.reportTypeError(rawSelectors, type, context);
        } else if (!hasExpectedSelector.hasExpectedStyle) {
          if (style === overrideStyle) {
            if (!hasExpectedSelector.hasExpectedPrefix) {
              SelectorUtils.reportStyleAndPrefixError(
                rawSelectors,
                style,
                prefix,
                context,
              );
            } else {
              SelectorUtils.reportStyleError(rawSelectors, style, context);
            }
          } else {
            context.report({
              node: rawSelectors,
              messageId: 'shadowDomEncapsulatedStyleFailure',
            });
          }
        } else if (!hasExpectedSelector.hasExpectedPrefix) {
          SelectorUtils.reportPrefixError(rawSelectors, prefix, context);
        }
      },
    };
  },
});

function hasEncapsulationShadowDomProperty(node: TSESTree.Decorator) {
  const encapsulationValue = ASTUtils.getDecoratorPropertyValue(
    node,
    'encapsulation',
  );
  return (
    encapsulationValue &&
    ASTUtils.isMemberExpression(encapsulationValue) &&
    TSESLintASTUtils.isIdentifier(encapsulationValue.object) &&
    encapsulationValue.object.name === VIEW_ENCAPSULATION &&
    TSESLintASTUtils.isIdentifier(encapsulationValue.property) &&
    encapsulationValue.property.name === VIEW_ENCAPSULATION_SHADOW_DOM
  );
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Consistent component selector naming conventions provide several benefits: they make components easily identifiable in templates and browser DevTools, prevent naming collisions with native HTML elements and third-party components, enable teams to quickly identify which library or feature area a component belongs to, and align with the Web Components specification for custom elements. For example, prefixing selectors with 'app-' (like 'app-user-profile') clearly distinguishes your application components from third-party libraries.",
};
