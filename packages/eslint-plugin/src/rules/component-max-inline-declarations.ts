import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getDecoratorPropertyValue,
  isLiteral,
  isTemplateLiteral,
  isArrayExpression,
} from '../utils/utils';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';

type Options = [
  {
    template?: number;
    styles?: number;
    animations?: number;
  },
];
export const messageId = 'componentMaxInlineDeclarations';
export type MessageIds = typeof messageId;
export const RULE_NAME = 'component-max-inline-declarations';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-04.';
const NEW_LINE_REGEXP = /\r\n|\r|\n/;
const DEFAULT_TEMPLATE_LIMIT = 3;
const DEFAULT_STYLES_LIMIT = 3;
const DEFAULT_ANIMATIONS_LIMIT = 15;

function getLinesCount(node: TSESTree.Node): number {
  if (isTemplateLiteral(node)) {
    return node.quasis[0].value.raw.trim().split(NEW_LINE_REGEXP).length;
  } else if (isLiteral(node)) {
    return node.raw.trim().split(NEW_LINE_REGEXP).length;
  }
  return 0;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows having too many lines in inline template and styles. Forces separate template or styles file creation.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          template: {
            type: 'number',
          },
          styles: {
            type: 'number',
          },
          animations: {
            type: 'number',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      componentMaxInlineDeclarations: `Exceeds the maximum allowed inline lines for {{propertyType}}. Defined limit: {{definedLimit}} / total lines: {{totalLines}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      template: DEFAULT_TEMPLATE_LIMIT,
      styles: DEFAULT_STYLES_LIMIT,
      animations: DEFAULT_ANIMATIONS_LIMIT,
    },
  ],
  create(context, [{ template = -1, styles = -1, animations = -1 }]) {
    template = template > -1 ? template : DEFAULT_TEMPLATE_LIMIT;
    styles = styles > -1 ? styles : DEFAULT_STYLES_LIMIT;
    animations = animations > -1 ? animations : DEFAULT_ANIMATIONS_LIMIT;
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const templatePropertyValue = getDecoratorPropertyValue(
          node,
          'template',
        );
        if (templatePropertyValue) {
          const totalLines = getLinesCount(templatePropertyValue);
          if (totalLines > template) {
            context.report({
              node: templatePropertyValue,
              messageId,
              data: {
                propertyType: 'template',
                definedLimit: template,
                totalLines,
              },
            });
          }
        }

        const stylesPropertyValue = getDecoratorPropertyValue(node, 'styles');
        if (stylesPropertyValue && isArrayExpression(stylesPropertyValue)) {
          const totalLines = stylesPropertyValue.elements.reduce(
            (lines, element) => lines + getLinesCount(element),
            0,
          );
          if (totalLines > styles) {
            context.report({
              node: stylesPropertyValue,
              messageId,
              data: {
                propertyType: 'styles',
                definedLimit: styles,
                totalLines,
              },
            });
          }
        }

        const animationsPropertyValue = getDecoratorPropertyValue(
          node,
          'animations',
        );
        if (
          animationsPropertyValue &&
          isArrayExpression(animationsPropertyValue)
        ) {
          const totalLines = animationsPropertyValue.elements.reduce(
            (lines, element) => lines + getLinesCount(element),
            0,
          );
          if (totalLines > animations) {
            context.report({
              node: animationsPropertyValue,
              messageId,
              data: {
                propertyType: 'animations',
                definedLimit: animations,
                totalLines,
              },
            });
          }
        }
      },
    };
  },
});
