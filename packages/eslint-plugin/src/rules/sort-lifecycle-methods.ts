import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'lifecycleMethodsNotSorted';
export const RULE_NAME = 'sort-lifecycle-methods';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that lifecycle methods are declared in order of execution',
    },
    schema: [],
    messages: {
      lifecycleMethodsNotSorted: `Lifecycle Methods are not declared in order of execution`,
    },
  },
  defaultOptions: [],
  create(context) {
    const isBefore = (
      method1: TSESTree.MethodDefinition,
      method2: TSESTree.MethodDefinition,
    ) => {
      const methodIndex1 = ASTUtils.angularLifecycleMethodsOrdered.indexOf(
        ASTUtils.getMethodName(method1) as ASTUtils.AngularLifecycleMethods,
      );
      const methodIndex2 = ASTUtils.angularLifecycleMethodsOrdered.indexOf(
        ASTUtils.getMethodName(method2) as ASTUtils.AngularLifecycleMethods,
      );

      return methodIndex1 < methodIndex2;
    };

    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const declaredMethods = ASTUtils.getDeclaredMethods(
          node.parent as TSESTree.ClassDeclaration,
        );
        const declaredLifeCycleMethods = declaredMethods.filter(
          (method: TSESTree.MethodDefinition) =>
            ASTUtils.isAngularLifecycleMethod(
              ASTUtils.getMethodName(method) ?? '',
            ),
        );

        for (let i = 1; i < declaredLifeCycleMethods.length; ++i) {
          const before = isBefore(
            declaredLifeCycleMethods[i],
            declaredLifeCycleMethods[i - 1],
          );

          if (before) {
            context.report({
              node: declaredLifeCycleMethods[i].key,
              messageId: 'lifecycleMethodsNotSorted',
            });
          }
        }
      },
    };
  },
});
