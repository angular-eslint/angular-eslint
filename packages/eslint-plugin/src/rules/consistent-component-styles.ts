import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'useStylesArray'
  | 'useStylesString'
  | 'useStyleUrl'
  | 'useStyleUrls';
export const RULE_NAME = 'consistent-component-styles';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures component `styles`/`styleUrl` with `string` is used over `styles`/`styleUrls` when there is only a single string in the array',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useStyleUrl:
        'Use `styleUrl` instead of `styleUrls` for a single stylesheet',
      useStyleUrls: 'Use `styleUrls` instead of `styleUrl`',
      useStylesArray:
        'Use a `string[]` instead of a `string` for the `styles` property',
      useStylesString:
        'Use a `string` instead of a `string[]` for the `styles` property',
    },
  },
  defaultOptions: [],
  create(context) {
    const {
      COMPONENT_CLASS_DECORATOR,
      LITERAL_OR_TEMPLATE_ELEMENT,
      metadataProperty,
    } = Selectors;
    const singleArrayStringLiteral = `ArrayExpression:matches([elements.length=1]:has(${LITERAL_OR_TEMPLATE_ELEMENT}))`;
    const singleStylesArrayExpression = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
      'styles',
    )} > ${singleArrayStringLiteral}`;
    const singleStyleUrlsProperty = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
      'styleUrls',
    )}:has(${singleArrayStringLiteral})`;

    return {
      [singleStylesArrayExpression](node: TSESTree.ArrayExpression) {
        context.report({
          node,
          messageId: 'useStylesString',
          fix: (fixer) => {
            const [el] = node.elements;
            if (el) {
              if (ASTUtils.isStringLiteral(el)) {
                return [fixer.replaceText(node, el.raw)];
              }
              if (ASTUtils.isTemplateLiteral(el)) {
                return [
                  fixer.replaceText(
                    node,
                    `${context.getSourceCode().getText(el)}`,
                  ),
                ];
              }
            }
            return [];
          },
        });
      },
      [singleStyleUrlsProperty](node: TSESTree.Property) {
        if (!ASTUtils.isArrayExpression(node.value)) return;
        const [el] = node.value.elements;

        context.report({
          node,
          messageId: 'useStyleUrl',
          fix: (fixer) => {
            if (el) {
              if (ASTUtils.isStringLiteral(el)) {
                return [fixer.replaceText(node, `styleUrl: ${el.raw}`)];
              }
              if (ASTUtils.isTemplateLiteral(el)) {
                return [
                  fixer.replaceText(
                    node,
                    `styleUrl: ${context.getSourceCode().getText(el)}`,
                  ),
                ];
              }
            }
            return [];
          },
        });
      },
    };
  },
});
