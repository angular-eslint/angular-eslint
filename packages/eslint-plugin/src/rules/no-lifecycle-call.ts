import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  ANGULAR_LIFECYCLE_METHODS,
  getAngularClassDecorator,
  getNearestNodeFrom,
  isClassDeclaration,
  isMethodDefinition,
  isSuper,
  toPattern,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'noLifecycleCall';
export const RULE_NAME = 'no-lifecycle-call';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows explicit calls to lifecycle methods',
      category: 'Best Practices',
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
      ...ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`ClassDeclaration CallExpression > MemberExpression[property.name=${angularLifeCycleMethodsPattern}]`]:
        (
          node: TSESTree.MemberExpression & { parent: TSESTree.CallExpression },
        ) => {
          const classDeclaration = getNearestNodeFrom(node, isClassDeclaration);

          if (
            !classDeclaration ||
            !getAngularClassDecorator(classDeclaration) ||
            (isSuper(node.object) && isSuperCallAllowed(node))
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
    ASTUtils.isIdentifier(property) &&
    ASTUtils.isIdentifier(key) &&
    property.name === key.name
  );
}

function isSuperCallAllowed(node: TSESTree.MemberExpression): boolean {
  const methodDefinition = getNearestNodeFrom(node, isMethodDefinition);

  return Boolean(methodDefinition && hasSameName(node, methodDefinition));
}
