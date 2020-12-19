import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import {
  getDecoratorName,
  isAngularClassDecorator,
  isAngularInnerClassDecorator,
  isNotNullOrUndefined,
  AngularClassDecoratorKeys,
  ANGULAR_CLASS_DECORATOR_MAPPER,
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
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      contextualDecorator:
        'Decorator out of context for "@{{classDecoratorName}}()"',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        // The TypeScript compiler parses `get` and `set` blocks into
        // `GetAccessor` and `SetAccessor` nodes, so basically these would've
        // been different AST nodes. The `@typescript-eslint/parser` parses `get`
        // and `set` blocks into `MethodDefinition` AST nodes, same as `constructor`
        // and single class methods, like `private myMethod() {}`.
        if (node.kind === 'constructor') {
          return;
        }

        validateNode(context, node);
      },
      ClassProperty(node: TSESTree.ClassProperty) {
        // This will be `PropertyDeclaration`.
        validateNode(context, node);
      },
      TSParameterProperty(node: TSESTree.TSParameterProperty) {
        // The `TSParameterProperty` is a parameter declaration inside a constructor,
        // e.g. `constructor(private myNumber: number) {}`.
        //                   ~~~~~~~~~~~~~~~~~~~~~~~~
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
  if (!node.decorators) {
    return;
  }

  const classDeclaration = lookupTheClassDeclaration(node);

  if (!classDeclaration) {
    return;
  }

  const classDecoratorName = getClassDecoratorName(classDeclaration);

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

function getClassDecoratorName(
  classDeclaration: TSESTree.ClassDeclaration,
): AngularClassDecoratorKeys | undefined {
  return (classDeclaration.decorators || [])
    .map(getDecoratorName)
    .filter(isNotNullOrUndefined)
    .find(isAngularClassDecorator);
}

function validateDecorator(
  context: TSESLint.RuleContext<MessageIds, []>,
  decorator: TSESTree.Decorator,
  classDecoratorName: AngularClassDecoratorKeys,
): void {
  const decoratorName: string | undefined = getDecoratorName(decorator);

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
