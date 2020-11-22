import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR } from '../utils/selectors';

import {
  getDeclaredMethods,
  getMethodName,
  isAngularLifecycleMethod,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'noEmptyLifecycleMethod';
export const RULE_NAME = 'no-empty-lifecycle-method';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows declaring empty lifecycle hook methods',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noEmptyLifecycleMethod: `Lifecycle method {{methodName}} should not be empty`,
    },
  },
  defaultOptions: [],
  create(context) {
    const isMethodEmpty = (node: TSESTree.MethodDefinition): boolean => {
      return !node.value.body || node.value.body.body.length === 0;
    };

    return {
      [COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const declaredMethods = getDeclaredMethods(classParent);

        for (const method of declaredMethods) {
          const methodName = getMethodName(method);
          if (!isAngularLifecycleMethod(methodName) || !isMethodEmpty(method))
            continue;

          context.report({
            node: method.key,
            messageId: 'noEmptyLifecycleMethod',
            data: {
              methodName,
            },
          });
        }
      },
    };
  },
});
