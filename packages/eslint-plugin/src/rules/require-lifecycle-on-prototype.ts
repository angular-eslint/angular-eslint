import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { ASTUtils, toPattern } from '@angular-eslint/utils';

export type Options = [];

const ISSUE_LINK = 'https://github.com/angular/angular/issues/38241';

export type MessageIds = 'defineOnPrototype';
export const RULE_NAME = 'require-lifecycle-on-prototype';

const angularLifecycleMethodsPattern = toPattern([
  ...ASTUtils.ANGULAR_LIFECYCLE_METHODS,
]);
const propertyDefinitionSelector = `PropertyDefinition > ${createAngularLifecycleMethodsPattern('key')}`;
const assignmentSelector = `AssignmentExpression[operator="="] > MemberExpression.left > ${createAngularLifecycleMethodsPattern('property')}`;

function createAngularLifecycleMethodsPattern(parentProperty: string): string {
  return `:matches(Literal.${parentProperty}[value=${angularLifecycleMethodsPattern}], Identifier.${parentProperty}[name=${angularLifecycleMethodsPattern}])`;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        "Ensures that lifecycle methods are defined on the object's prototype instead of on an instance.",
    },
    schema: [],
    messages: {
      defineOnPrototype: `The {{ method }} lifecycle method should be defined on the object's prototype. See more at ${ISSUE_LINK}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [propertyDefinitionSelector](
        node: TSESTree.Literal | TSESTree.Identifier,
      ) {
        context.report({
          node,
          messageId: 'defineOnPrototype',
          data: {
            method:
              node.type === AST_NODE_TYPES.Literal ? node.value : node.name,
          },
        });
      },
      [assignmentSelector](node: TSESTree.Literal | TSESTree.Identifier) {
        // Assigning to the prototype is OK.
        if (!isPrototype((node.parent as TSESTree.MemberExpression).object)) {
          context.report({
            node,
            messageId: 'defineOnPrototype',
            data: {
              method:
                node.type === AST_NODE_TYPES.Literal ? node.value : node.name,
            },
          });
        }
      },
    };
  },
});

function isPrototype(node: TSESTree.Node): boolean {
  while (node.type === AST_NODE_TYPES.TSAsExpression) {
    node = node.expression;
  }
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    switch (node.property.type) {
      case AST_NODE_TYPES.Identifier:
        return node.property.name === 'prototype';

      case AST_NODE_TYPES.Literal:
        return node.property.value === 'prototype';
    }
  }
  return false;
}
