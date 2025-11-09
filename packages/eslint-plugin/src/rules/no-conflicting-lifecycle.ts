import { ASTUtils } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds =
  | 'noConflictingLifecycleInterface'
  | 'noConflictingLifecycleMethod';
export const RULE_NAME = 'no-conflicting-lifecycle';
const LIFECYCLE_INTERFACES: readonly ASTUtils.AngularLifecycleInterfaceKeys[] =
  [
    ASTUtils.AngularLifecycleInterfaces.DoCheck,
    ASTUtils.AngularLifecycleInterfaces.OnChanges,
  ];
const LIFECYCLE_METHODS: readonly ASTUtils.AngularLifecycleMethodKeys[] = [
  ASTUtils.AngularLifecycleMethods.ngDoCheck,
  ASTUtils.AngularLifecycleMethods.ngOnChanges,
];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that directives do not implement conflicting lifecycle interfaces.',
    },
    schema: [],
    messages: {
      noConflictingLifecycleInterface: `Implementing ${ASTUtils.AngularLifecycleInterfaces.DoCheck} and ${ASTUtils.AngularLifecycleInterfaces.OnChanges} in a class is not recommended`,
      noConflictingLifecycleMethod: `Declaring ${ASTUtils.AngularLifecycleMethods.ngDoCheck} and ${ASTUtils.AngularLifecycleMethods.ngOnChanges} method in a class is not recommended`,
    },
  },
  defaultOptions: [],
  create(context) {
    const validateInterfaces = (node: TSESTree.ClassDeclaration) => {
      const declaredAngularLifecycleInterfaces =
        ASTUtils.getDeclaredAngularLifecycleInterfaces(node);

      const hasInterfaceConflictingLifecycle = LIFECYCLE_INTERFACES.every(
        (lifecycleInterface) =>
          declaredAngularLifecycleInterfaces.includes(lifecycleInterface),
      );

      if (!hasInterfaceConflictingLifecycle) return;

      const declaredInterfaces = ASTUtils.getInterfaces(node);
      const declaredAngularLifecycleInterfacesNodes = declaredInterfaces.filter(
        (node) => {
          const interfaceName = ASTUtils.getInterfaceName(node);
          return (
            interfaceName && ASTUtils.isAngularLifecycleInterface(interfaceName)
          );
        },
      );

      for (const interFaceNode of declaredAngularLifecycleInterfacesNodes) {
        context.report({
          node: interFaceNode,
          messageId: 'noConflictingLifecycleInterface',
        });
      }
    };
    const validateMethods = (node: TSESTree.ClassDeclaration) => {
      const declaredAngularLifecycleMethods =
        ASTUtils.getDeclaredAngularLifecycleMethods(node);

      const hasMethodConflictingLifecycle = LIFECYCLE_METHODS.every(
        (lifecycleMethod) =>
          declaredAngularLifecycleMethods.includes(lifecycleMethod),
      );

      if (!hasMethodConflictingLifecycle) return;

      const declaredMethods = ASTUtils.getDeclaredMethods(node);
      const declaredAngularLifecycleMethodNodes = declaredMethods.filter(
        (node) =>
          TSESLintASTUtils.isIdentifier(node.key) &&
          ASTUtils.isAngularLifecycleMethod(node.key.name),
      );

      for (const method of declaredAngularLifecycleMethodNodes) {
        context.report({
          node: method,
          messageId: 'noConflictingLifecycleMethod',
        });
      }
    };

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        validateInterfaces(node);
        validateMethods(node);
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'This rule was created with the intent to prevent potential issues when both DoCheck and OnChanges lifecycle hooks are implemented together, as they both deal with change detection and could create confusing or duplicated logic. However, the rule has proven to be overly broad in practice. It triggers whenever a component or directive implements both hooks, regardless of whether they actually conflict or track the same data. In reality, there are legitimate use cases where both hooks can coexist without issues—for instance, using OnChanges to respond to specific input changes while using DoCheck for custom change detection logic on different data. Because the rule cannot accurately determine whether the hooks are actually conflicting (i.e., checking the same variables), it produces false positives and has been removed from the recommended configuration. While the rule was well-intentioned, it should not be relied upon in practice.',
};
