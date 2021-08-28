import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { Options } from '../utils/property-selector';
import {
  checkSelector,
  checkValidOptions,
  OPTION_TYPE_ATTRIBUTE,
  OPTION_TYPE_ELEMENT,
  reportPrefixError,
  reportStyleError,
  reportTypeError,
} from '../utils/property-selector';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import type { SelectorStyle } from '../utils/utils';
import {
  arrayify,
  getDecoratorPropertyValue,
  isMemberExpression,
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
} from '../utils/utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';

const VIEW_ENCAPSULATION_SHADOW_DOM = 'ShadowDom';
const VIEW_ENCAPSULATION = 'ViewEncapsulation';
export const RULE_NAME = 'component-selector';
export type MessageIds =
  | 'prefixFailure'
  | 'styleFailure'
  | 'typeFailure'
  | 'shadowDomEncapsulatedStyleFailure';
const STYLE_GUIDE_PREFIX_LINK =
  'https://angular.io/guide/styleguide#style-02-07';
const STYLE_GUIDE_STYLE_LINK =
  'https://angular.io/guide/styleguide#style-05-02';
const STYLE_GUIDE_TYPE_LINK = 'https://angular.io/guide/styleguide#style-05-03';
const SHADOW_DOM_ENCAPSULATED_STYLE_LINK =
  'https://github.com/angular-eslint/angular-eslint/issues/534';

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
      prefixFailure: `The selector should start with one of these prefixes: {{prefix}} (${STYLE_GUIDE_PREFIX_LINK})`,
      styleFailure: `The selector should be {{style}} (${STYLE_GUIDE_STYLE_LINK})`,
      typeFailure: `The selector should be used as an {{type}} (${STYLE_GUIDE_TYPE_LINK})`,
      shadowDomEncapsulatedStyleFailure: `The selector of a ShadowDom-encapsulated component should be \`${OPTION_STYLE_KEBAB_CASE}\` (${SHADOW_DOM_ENCAPSULATED_STYLE_LINK})`,
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
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawSelectors = getDecoratorPropertyValue(node, 'selector');

        if (!rawSelectors) {
          return;
        }

        const isValidOptions = checkValidOptions(type, prefix, style);

        if (!isValidOptions) {
          return;
        }

        // override `style` for ShadowDom-encapsulated components. See https://github.com/angular-eslint/angular-eslint/issues/534.
        const overrideStyle =
          style !== OPTION_STYLE_KEBAB_CASE &&
          hasEncapsulationShadowDomProperty(node)
            ? OPTION_STYLE_KEBAB_CASE
            : style;

        const hasExpectedSelector = checkSelector(
          rawSelectors,
          type,
          arrayify<string>(prefix),
          overrideStyle as SelectorStyle,
        );

        if (hasExpectedSelector === null) {
          return;
        }

        if (!hasExpectedSelector.hasExpectedType) {
          reportTypeError(rawSelectors, type, context);
        } else if (!hasExpectedSelector.hasExpectedStyle) {
          if (style === overrideStyle) {
            reportStyleError(rawSelectors, style, context);
          } else {
            context.report({
              node: rawSelectors,
              messageId: 'shadowDomEncapsulatedStyleFailure',
            });
          }
        } else if (!hasExpectedSelector.hasExpectedPrefix) {
          reportPrefixError(rawSelectors, prefix, context);
        }
      },
    };
  },
});

function hasEncapsulationShadowDomProperty(node: TSESTree.Decorator) {
  const encapsulationValue = getDecoratorPropertyValue(node, 'encapsulation');
  return (
    encapsulationValue &&
    isMemberExpression(encapsulationValue) &&
    ASTUtils.isIdentifier(encapsulationValue.object) &&
    encapsulationValue.object.name === VIEW_ENCAPSULATION &&
    ASTUtils.isIdentifier(encapsulationValue.property) &&
    encapsulationValue.property.name === VIEW_ENCAPSULATION_SHADOW_DOM
  );
}
