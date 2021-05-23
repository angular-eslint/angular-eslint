import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import { getDecoratorPropertyValue } from '../utils/utils';

type Options = [];
export type MessageIds = 'preferOnPushComponentChangeDetection';
export const RULE_NAME = 'prefer-on-push-component-change-detection';

const ON_PUSH = 'OnPush';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Enforces component's change detection to ChangeDetectionStrategy.${ON_PUSH}.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      preferOnPushComponentChangeDetection: `The changeDetection value of a component should be set to ChangeDetectionStrategy.${ON_PUSH}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const changeDetectionExpression = getDecoratorPropertyValue(
          node,
          'changeDetection',
        ) as TSESTree.MemberExpression;

        if (!changeDetectionExpression) {
          context.report({
            node,
            messageId: 'preferOnPushComponentChangeDetection',
          });
          return;
        }

        if (
          !ASTUtils.isIdentifier(changeDetectionExpression.property) ||
          changeDetectionExpression.property.name !== ON_PUSH
        ) {
          context.report({
            node: changeDetectionExpression,
            messageId: 'preferOnPushComponentChangeDetection',
          });
          return;
        }
      },
    };
  },
});
