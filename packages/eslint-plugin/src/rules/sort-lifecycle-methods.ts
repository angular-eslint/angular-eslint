import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { AngularLifecycleMethods } from '@angular-eslint/utils/dist/eslint-plugin/ast-utils';

type Options = [];
export type MessageIds =
  | 'lifecycleMethodsNotSorted'
  | 'nonLifecycleMethodBeforeLifecycleMethod';
export const RULE_NAME = 'sort-lifecycle-methods';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that lifecycle methods are declared in chronological order',
      recommended: 'warn',
    },
    schema: [],
    messages: {
      lifecycleMethodsNotSorted: `Lifecycle Methods are not declared in chronological order`,
      nonLifecycleMethodBeforeLifecycleMethod:
        'Non-Lifecycle method is declared before a Lifecycle Method',
    },
  },
  defaultOptions: [],
  create(context) {
    const isBefore = (
      method1: TSESTree.MethodDefinition,
      method2: TSESTree.MethodDefinition,
    ) => {
      const methodName1 = ASTUtils.getMethodName(
        method1,
      ) as AngularLifecycleMethods;
      const methodName2 = ASTUtils.getMethodName(
        method2,
      ) as AngularLifecycleMethods;
      return (
        ASTUtils.angularLifecycleMethodsOrdered.indexOf(methodName1) <
        ASTUtils.angularLifecycleMethodsOrdered.indexOf(methodName2)
      );
    };

    const isLifecycleMethod = (method: TSESTree.MethodDefinition) => {
      const methodName = ASTUtils.getMethodName(
        method,
      ) as AngularLifecycleMethods;
      return ASTUtils.angularLifecycleMethodsOrdered.includes(methodName);
    };

    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classDeclaration = node.parent as TSESTree.ClassDeclaration;
        const declaredMethods = ASTUtils.getDeclaredMethods(classDeclaration);

        for (let i = 1; i < declaredMethods.length; ++i) {
          const previous = declaredMethods[i - 1];
          const current = declaredMethods[i];
          if (!isLifecycleMethod(previous) && isLifecycleMethod(current)) {
            context.report({
              node: previous.key,
              messageId: 'nonLifecycleMethodBeforeLifecycleMethod',
            });
          }
        }

        const declaredLifeCycleMethods = declaredMethods.filter((method) =>
          isLifecycleMethod(method),
        );
        for (let i = 1; i < declaredLifeCycleMethods.length; ++i) {
          if (
            isBefore(
              declaredLifeCycleMethods[i],
              declaredLifeCycleMethods[i - 1],
            )
          ) {
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
