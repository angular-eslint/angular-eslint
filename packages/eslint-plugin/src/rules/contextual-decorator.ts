import { ASTUtils } from '@angular-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'contextualDecorator';
export const RULE_NAME = 'contextual-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that classes use contextual decorators in its body',
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
      'MethodDefinition[kind=/^(get|set|method)$/], PropertyDefinition, TSParameterProperty'(
        node:
          | TSESTree.MethodDefinition
          | TSESTree.PropertyDefinition
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
    | TSESTree.PropertyDefinition
    | TSESTree.TSParameterProperty,
): void {
  if (!node.decorators?.length) {
    return;
  }

  const classDeclaration = ASTUtils.getNearestNodeFrom(
    node,
    ASTUtils.isClassDeclaration,
  );

  if (!classDeclaration) {
    return;
  }

  const classDecoratorName =
    ASTUtils.getAngularClassDecorator(classDeclaration);

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
  classDecoratorName: ASTUtils.AngularClassDecoratorKeys,
): void {
  const decoratorName = ASTUtils.getDecoratorName(decorator);

  if (!decoratorName || !ASTUtils.isAngularInnerClassDecorator(decoratorName)) {
    return;
  }

  const allowedDecorators =
    ASTUtils.ANGULAR_CLASS_DECORATOR_MAPPER.get(classDecoratorName);

  if (allowedDecorators?.has(decoratorName)) {
    return;
  }

  context.report({
    node: decorator,
    messageId: 'contextualDecorator',
    data: { classDecoratorName },
  });
}
