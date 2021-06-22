import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import { getDecoratorPropertyValue, isStringLiteral } from '../utils/utils';

type Options = [];
export type MessageIds = 'useComponentSelector';
export const RULE_NAME = 'use-component-selector';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Component selector must be declared',
      category: 'Best Practices',
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
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const selector = getDecoratorPropertyValue(node, 'selector');

        if (selector && isStringLiteral(selector) && selector.value.length) {
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
