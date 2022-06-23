import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly template?: number;
    readonly styles?: number;
    readonly animations?: number;
  },
];
export type MessageIds = 'componentMaxInlineDeclarations';
export const RULE_NAME = 'component-max-inline-declarations';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-04';
const NEW_LINE_REGEXP = /\r\n|\r|\n/;
const DEFAULT_TEMPLATE_LIMIT = 3;
const DEFAULT_STYLES_LIMIT = 3;
const DEFAULT_ANIMATIONS_LIMIT = 15;

function getLinesCount(node: TSESTree.Node): number {
  if (ASTUtils.isTemplateLiteral(node)) {
    return node.quasis[0].value.raw.trim().split(NEW_LINE_REGEXP).length;
  }

  if (ASTUtils.isLiteral(node)) {
    return node.raw.trim().split(NEW_LINE_REGEXP).length;
  }

  return 0;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Enforces a maximum number of lines in inline template, styles and animations. See more at ${STYLE_GUIDE_LINK}`,
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          template: { minimum: 0, type: 'number' },
          styles: { minimum: 0, type: 'number' },
          animations: { minimum: 0, type: 'number' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      componentMaxInlineDeclarations: `\`{{propertyType}}\` has too many lines ({{lineCount}}). Maximum allowed is {{max}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      template: DEFAULT_TEMPLATE_LIMIT,
      styles: DEFAULT_STYLES_LIMIT,
      animations: DEFAULT_ANIMATIONS_LIMIT,
    },
  ],
  create(
    context,
    [
      {
        template = DEFAULT_TEMPLATE_LIMIT,
        styles = DEFAULT_STYLES_LIMIT,
        animations = DEFAULT_ANIMATIONS_LIMIT,
      },
    ],
  ) {
    return {
      [`${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name='template']`]({
        value,
      }: TSESTree.Property) {
        const lineCount = getLinesCount(value);

        if (lineCount <= template) return;

        context.report({
          node: value,
          messageId: 'componentMaxInlineDeclarations',
          data: {
            lineCount,
            max: template,
            propertyType: 'template',
          },
        });
      },
      [`${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name='styles']`]({
        value,
      }: TSESTree.Property) {
        if (!ASTUtils.isArrayExpression(value)) return;

        const lineCount = value.elements.reduce(
          (lines, element) => lines + getLinesCount(element),
          0,
        );

        if (lineCount <= styles) return;

        context.report({
          node: value,
          messageId: 'componentMaxInlineDeclarations',
          data: {
            lineCount,
            max: styles,
            propertyType: 'styles',
          },
        });
      },
      [`${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name='animations']`]({
        value,
      }: TSESTree.Property) {
        if (!ASTUtils.isArrayExpression(value) || value.elements.length === 0)
          return;

        const animationsBracketsSize = 2;
        const lineCount = Math.max(
          value.loc.end.line - value.loc.start.line - animationsBracketsSize,
          1,
        );

        if (lineCount <= animations) return;

        context.report({
          node: value,
          messageId: 'componentMaxInlineDeclarations',
          data: {
            lineCount,
            max: animations,
            propertyType: 'animations',
          },
        });
      },
    };
  },
});
