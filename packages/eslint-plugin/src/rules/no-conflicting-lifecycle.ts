import { ASTUtils } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
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
        'Ensures that directives not implement conflicting lifecycle interfaces.',
      recommended: 'error',
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
