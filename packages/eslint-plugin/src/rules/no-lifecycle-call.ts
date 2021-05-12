import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  ANGULAR_LIFECYCLE_METHODS,
  isSuper,
  isClassDeclaration,
  isIdentifier,
  isMethodDefinition,
  toPattern,
  getAngularClassDecorator,
  getNearestNodeFrom,
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
      [`ClassDeclaration MemberExpression[property.name=${angularLifeCycleMethodsPattern}]`]: (
        node: TSESTree.MemberExpression,
      ) => {
        if (
          !getAngularClassDecorator(getClassDeclaration(node)!) ||
          (isSuper(node.object) && isSuperCallAllowed(node))
        ) {
          return;
        }

        context.report({ node: node.parent!, messageId: 'noLifecycleCall' });
      },
    };
  },
});

function getClassDeclaration(
  node: TSESTree.MemberExpression,
): TSESTree.ClassDeclaration | null {
  return getNearestNodeFrom(node, isClassDeclaration);
}

function hasSameName(
  { property }: TSESTree.MemberExpression,
  { key }: TSESTree.MethodDefinition,
): boolean {
  return (
    isIdentifier(property) && isIdentifier(key) && property.name === key.name
  );
}

function isSuperCallAllowed(node: TSESTree.MemberExpression): boolean {
  const methodDefinition = getNearestNodeFrom(node, isMethodDefinition);

  return Boolean(methodDefinition && hasSameName(node, methodDefinition));
}
