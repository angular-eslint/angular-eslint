import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { AngularClassDecoratorKeys } from '../utils/utils';
import {
  ANGULAR_CLASS_DECORATOR_MAPPER,
  getAngularClassDecorator,
  getDecoratorName,
  getNearestNodeFrom,
  isAngularInnerClassDecorator,
  isClassDeclaration,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'contextualDecorator';
export const RULE_NAME = 'contextual-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that classes use contextual decorators in its body',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      contextualDecorator:
        'Decorator out of context for "@{{classDecoratorName}}()"',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'MethodDefinition[kind=/^(get|set|method)$/], ClassProperty, TSParameterProperty'(
        node:
          | TSESTree.MethodDefinition
          | TSESTree.ClassProperty
          | TSESTree.TSParameterProperty,
      ) {
        validateNode(context, node);
      },
    };
  },
});

function validateNode(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  node:
    | TSESTree.MethodDefinition
    | TSESTree.ClassProperty
    | TSESTree.TSParameterProperty,
): void {
  if (!node.decorators?.length) {
    return;
  }

  const classDeclaration = getNearestNodeFrom(node, isClassDeclaration);

  if (!classDeclaration) {
    return;
  }

  const classDecoratorName = getAngularClassDecorator(classDeclaration);

  if (!classDecoratorName) {
    return;
  }

  for (const decorator of node.decorators) {
    validateDecorator(context, decorator, classDecoratorName);
  }
}

function validateDecorator(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  decorator: TSESTree.Decorator,
  classDecoratorName: AngularClassDecoratorKeys,
): void {
  const decoratorName = getDecoratorName(decorator);

  if (!decoratorName || !isAngularInnerClassDecorator(decoratorName)) {
    return;
  }

  const allowedDecorators =
    ANGULAR_CLASS_DECORATOR_MAPPER.get(classDecoratorName);

  if (allowedDecorators?.has(decoratorName)) {
    return;
  }

  context.report({
    node: decorator,
    messageId: 'contextualDecorator',
    data: { classDecoratorName },
  });
}
