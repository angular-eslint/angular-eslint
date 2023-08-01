import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'lifecycleMethodBeforeConstructor'
  | 'lifecycleMethodsNotSorted'
  | 'nonLifecycleMethodBeforeLifecycleMethod';
export const RULE_NAME = 'sort-lifecycle-methods';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that lifecycle methods are declared in order of execution',
      recommended: false,
    },
    schema: [],
    messages: {
      lifecycleMethodBeforeConstructor: `Lifecycle Method declared before constructor`,
      lifecycleMethodsNotSorted: `Lifecycle Methods are not declared in order of execution`,
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

        // Check method not before lifecycle hook, except constructor
        for (let i = 1; i < declaredMethods.length; ++i) {
          const previousMethod = declaredMethods[i - 1];
          const currentMethod = declaredMethods[i];
          const previousMethodName =
            ASTUtils.getMethodName(previousMethod) ?? '';
          const currentMethodName = ASTUtils.getMethodName(currentMethod) ?? '';

          if (
            !ASTUtils.isConstructor(previousMethod) &&
            !ASTUtils.isAngularLifecycleMethod(previousMethodName) &&
            ASTUtils.isAngularLifecycleMethod(currentMethodName)
          ) {
            context.report({
              node: previousMethod.key,
              messageId: 'nonLifecycleMethodBeforeLifecycleMethod',
            });
          } else if (
            ASTUtils.isConstructor(currentMethod) &&
            ASTUtils.isAngularLifecycleMethod(previousMethodName)
          ) {
            context.report({
              node: previousMethod.key,
              messageId: 'lifecycleMethodBeforeConstructor',
            });
          }
        }

        const declaredLifeCycleMethods = declaredMethods.filter(
          (method: TSESTree.MethodDefinition) =>
            ASTUtils.isAngularLifecycleMethod(
              ASTUtils.getMethodName(method) ?? '',
            ),
        );

        // check execution order
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
