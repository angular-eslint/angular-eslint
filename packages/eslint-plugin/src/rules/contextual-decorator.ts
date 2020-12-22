import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import {
  isAngularInnerClassDecorator,
  AngularClassDecoratorKeys,
  ANGULAR_CLASS_DECORATOR_MAPPER,
  getAngularClassDecorator,
  getDecoratorName,
} from '../utils/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'contextualDecorator';
export const RULE_NAME = 'contextual-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that classes use contextual decorators in its body.',
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
  context: TSESLint.RuleContext<MessageIds, []>,
  node:
    | TSESTree.MethodDefinition
    | TSESTree.ClassProperty
    | TSESTree.TSParameterProperty,
): void {
  if (!node.decorators?.length) {
    return;
  }

  const classDeclaration = lookupTheClassDeclaration(node);

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

function lookupTheClassDeclaration(
  node: TSESTree.Node,
): TSESTree.ClassDeclaration | null {
  while (node.parent) {
    if (node.type === 'ClassDeclaration') {
      return node;
    }

    node = node.parent;
  }

  return null;
}

function validateDecorator(
  context: TSESLint.RuleContext<MessageIds, []>,
  decorator: TSESTree.Decorator,
  classDecoratorName: AngularClassDecoratorKeys,
): void {
  const decoratorName = getDecoratorName(decorator);

  if (!decoratorName || !isAngularInnerClassDecorator(decoratorName)) {
    return;
  }

  const allowedDecorators = ANGULAR_CLASS_DECORATOR_MAPPER.get(
    classDecoratorName,
  );

  if (!allowedDecorators || allowedDecorators.has(decoratorName)) {
    return;
  }

  context.report({
    node: decorator,
    messageId: 'contextualDecorator',
    data: { classDecoratorName },
  });
}
