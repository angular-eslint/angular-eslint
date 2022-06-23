import { ASTUtils, toPattern } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noLifecycleCall';
export const RULE_NAME = 'no-lifecycle-call';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows explicit calls to lifecycle methods',
      recommended: false,
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
