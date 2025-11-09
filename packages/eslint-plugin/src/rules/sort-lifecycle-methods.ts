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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Organizing lifecycle methods in the order they execute (ngOnChanges, ngOnInit, ngDoCheck, ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, ngOnDestroy) makes the component lifecycle easier to understand and follow. When methods appear in execution order, developers can mentally trace the component's lifecycle from initialization through destruction just by reading down the file. This natural ordering helps both when writing new code (you know where to add lifecycle logic) and when debugging (you can follow the execution path visually). Randomly ordered lifecycle methods force developers to jump around the file and mentally reconstruct the execution sequence. Consistent ordering is a simple organizational principle that significantly improves code readability.",
};
