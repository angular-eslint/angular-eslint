import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noSingleStylesArray' | 'noSingleStyleUrl';
export const RULE_NAME = 'no-single-styles-array';

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
      noSingleStyleUrl:
        'Use `styleUrl` over `styleUrls` for a single stylesheet',
      noSingleStylesArray:
        'Use a `string` over `[string]` for the `styles` property',
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
          messageId: 'noSingleStylesArray',
          fix: (fixer) => {
            const [el] = node.elements;
            // TODO: Do we need the fix to apply for template strings?
            if (!el || !ASTUtils.isStringLiteral(el)) return [];
            return [fixer.replaceText(node, `'${el.value}'`)];
          },
        });
      },
      [singleStyleUrlsProperty](node: TSESTree.Property) {
        if (!ASTUtils.isArrayExpression(node.value)) return;
        const [el] = node.value.elements;

        context.report({
          node,
          messageId: 'noSingleStyleUrl',
          fix: (fixer) => {
            // TODO: Do we need to fix for using template strings?
            if (!el || !ASTUtils.isStringLiteral(el)) return [];
            return [fixer.replaceText(node, `styleUrl: '${el.value}'`)];
          },
        });
      },
    };
  },
});
