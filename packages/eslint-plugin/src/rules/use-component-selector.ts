import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  isLiteralWithStringValue,
} from '../utils/utils';

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
      useComponentSelector: `The selector of the component '{{className}}' is mandatory`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        if (!classParent || !classParent.id || !classParent.id.name) {
          return;
        }

        const selector = getDecoratorPropertyValue(node, 'selector');

        if (
          selector &&
          isLiteralWithStringValue(selector) &&
          selector.value.length
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'useComponentSelector',
          data: {
            className: classParent.id.name,
          },
        });
      },
    };
  },
});
