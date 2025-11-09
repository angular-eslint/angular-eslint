import { ASTUtils, toPattern } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noLifecycleCall';
export const RULE_NAME = 'no-lifecycle-call';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows explicit calls to lifecycle methods',
    },
    schema: [],
    messages: {
      noLifecycleCall: 'Avoid explicit calls to lifecycle methods',
    },
  },
  defaultOptions: [],
  create(context) {
    const angularLifeCycleMethodsPattern = toPattern([
      ...ASTUtils.ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`ClassDeclaration CallExpression > MemberExpression[property.name=${angularLifeCycleMethodsPattern}]`]:
        (
          node: TSESTree.MemberExpression & { parent: TSESTree.CallExpression },
        ) => {
          const classDeclaration = ASTUtils.getNearestNodeFrom(
            node,
            ASTUtils.isClassDeclaration,
          );

          if (
            !classDeclaration ||
            !ASTUtils.getAngularClassDecorator(classDeclaration) ||
            (ASTUtils.isSuper(node.object) && isSuperCallAllowed(node))
          ) {
            return;
          }

          context.report({ node: node.parent, messageId: 'noLifecycleCall' });
        },
    };
  },
});

function hasSameName(
  { property }: TSESTree.MemberExpression,
  { key }: TSESTree.MethodDefinition,
): boolean {
  return (
    TSESLintASTUtils.isIdentifier(property) &&
    TSESLintASTUtils.isIdentifier(key) &&
    property.name === key.name
  );
}

function isSuperCallAllowed(node: TSESTree.MemberExpression): boolean {
  const methodDefinition = ASTUtils.getNearestNodeFrom(
    node,
    ASTUtils.isMethodDefinition,
  );

  return Boolean(methodDefinition && hasSameName(node, methodDefinition));
}

export const RULE_DOCS_EXTENSION = {
  rationale: `Lifecycle hooks like ngOnInit(), ngOnDestroy(), and ngOnChanges() are designed to be called automatically by Angular at the appropriate times in a component's lifecycle. Calling them manually (e.g., 'this.ngOnInit()') breaks Angular's lifecycle management, can cause hooks to run multiple times or in the wrong order, and makes the code's execution flow harder to understand. The only exception is calling super.ngOnInit() in a derived class to ensure the parent class's initialization runs. If you need to share initialization logic, extract it into a separate method that both ngOnInit() and your other code can call.`,
};
