import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  isIdentifier,
  isMemberExpression,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'useComponentViewEncapsulation';
export const RULE_NAME = 'use-component-view-encapsulation';

const NONE = 'None';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows using ViewEncapsulation.${NONE}`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      useComponentViewEncapsulation: `Using ViewEncapsulation.${NONE} makes your styles global, which may have an unintended effect`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const encapsulationExpression = getDecoratorPropertyValue(
          node,
          'encapsulation',
        );

        if (
          !encapsulationExpression ||
          (isMemberExpression(encapsulationExpression) &&
            isIdentifier(encapsulationExpression.property) &&
            encapsulationExpression.property.name !== NONE)
        ) {
          return;
        }

        context.report({
          node: encapsulationExpression,
          messageId: 'useComponentViewEncapsulation',
        });
      },
    };
  },
});
