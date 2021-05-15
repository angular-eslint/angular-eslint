import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  ANGULAR_LIFECYCLE_METHODS,
  getAngularClassDecorator,
  toPattern,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'noEmptyLifecycleMethod';
export const RULE_NAME = 'no-empty-lifecycle-method';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows declaring empty lifecycle methods',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noEmptyLifecycleMethod: 'Lifecycle methods should not be empty',
    },
  },
  defaultOptions: [],
  create(context) {
    const angularLifecycleMethodsPattern = toPattern([
      ...ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`ClassDeclaration > ClassBody > MethodDefinition[key.name=${angularLifecycleMethodsPattern}][value.body.body.length=0]`](
        node: TSESTree.MethodDefinition & {
          parent: TSESTree.ClassBody & { parent: TSESTree.ClassDeclaration };
        },
      ) {
        if (!getAngularClassDecorator(node.parent.parent)) return;

        context.report({
          node,
          messageId: 'noEmptyLifecycleMethod',
        });
      },
    };
  },
});
