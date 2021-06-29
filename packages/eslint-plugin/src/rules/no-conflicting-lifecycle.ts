import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type {
  AngularLifecycleInterfaceKeys,
  AngularLifecycleMethodKeys,
} from '../utils/utils';
import {
  AngularLifecycleInterfaces,
  AngularLifecycleMethods,
  getDeclaredAngularLifecycleInterfaces,
  getDeclaredAngularLifecycleMethods,
  getDeclaredInterfaces,
  getDeclaredMethods,
  isAngularLifecycleInterface,
  isAngularLifecycleMethod,
} from '../utils/utils';

type Options = [];
export type MessageIds =
  | 'noConflictingLifecycleInterface'
  | 'noConflictingLifecycleMethod';
export const RULE_NAME = 'no-conflicting-lifecycle';
const LIFECYCLE_INTERFACES: readonly AngularLifecycleInterfaceKeys[] = [
  AngularLifecycleInterfaces.DoCheck,
  AngularLifecycleInterfaces.OnChanges,
];
const LIFECYCLE_METHODS: readonly AngularLifecycleMethodKeys[] = [
  AngularLifecycleMethods.ngDoCheck,
  AngularLifecycleMethods.ngOnChanges,
];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that directives not implement conflicting lifecycle interfaces.',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noConflictingLifecycleInterface: `Implementing ${AngularLifecycleInterfaces.DoCheck} and ${AngularLifecycleInterfaces.OnChanges} in a class is not recommended`,
      noConflictingLifecycleMethod: `Declaring ${AngularLifecycleMethods.ngDoCheck} and ${AngularLifecycleMethods.ngOnChanges} method in a class is not recommended`,
    },
  },
  defaultOptions: [],
  create(context) {
    const validateInterfaces = (node: TSESTree.ClassDeclaration) => {
      const declaredAngularLifecycleInterfaces =
        getDeclaredAngularLifecycleInterfaces(node);

      const hasInterfaceConflictingLifecycle = LIFECYCLE_INTERFACES.every(
        (lifecycleInterface) =>
          declaredAngularLifecycleInterfaces.includes(lifecycleInterface),
      );

      if (!hasInterfaceConflictingLifecycle) return;

      const declaredInterfaces = getDeclaredInterfaces(node);
      const declaredAngularLifecycleInterfacesNodes = declaredInterfaces.filter(
        (node) =>
          ASTUtils.isIdentifier(node.expression) &&
          isAngularLifecycleInterface(node.expression.name),
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
        getDeclaredAngularLifecycleMethods(node);

      const hasMethodConflictingLifecycle = LIFECYCLE_METHODS.every(
        (lifecycleMethod) =>
          declaredAngularLifecycleMethods.includes(lifecycleMethod),
      );

      if (!hasMethodConflictingLifecycle) return;

      const declaredMethods = getDeclaredMethods(node);
      const declaredAngularLifecycleMethodNodes = declaredMethods.filter(
        (node) =>
          ASTUtils.isIdentifier(node.key) &&
          isAngularLifecycleMethod(node.key.name),
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
