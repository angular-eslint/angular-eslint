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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Lifecycle methods in Angular must be defined on the class prototype (using method syntax) rather than as instance properties (using arrow functions or property assignments). Angular's change detection looks for lifecycle methods on the prototype chain, and defining them as instance properties can prevent Angular from finding and invoking them correctly. This is a subtle but critical issue that can cause lifecycle hooks to silently fail. For example, if ngOnInit is defined as a class property (ngOnInit = () => {}), Angular will not call it, leading to missing initialization logic. Using standard method definitions ensures lifecycle hooks are placed on the prototype where Angular expects them.",
};
