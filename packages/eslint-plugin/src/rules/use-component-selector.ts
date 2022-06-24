import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'useComponentSelector';
export const RULE_NAME = 'use-component-selector';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Component selector must be declared',
      recommended: false,
    },
    schema: [],
    messages: {
      useComponentSelector: 'The selector of the component is mandatory',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const selector = ASTUtils.getDecoratorPropertyValue(node, 'selector');

        if (
          selector &&
          ASTUtils.isStringLiteral(selector) &&
          selector.value.length
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'useComponentSelector',
        });
      },
    };
  },
});
