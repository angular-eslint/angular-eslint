import { createESLintRule } from '../utils/create-eslint-rule';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

export type Options = [];
export type MessageIds = 'computedMissingReturn';
export const RULE_NAME = 'computed-must-return';

export default createESLintRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      recommended: 'recommended',
      description: `Ensures that computed() returns a value. Omitting the value is likely a mistake.`,
    },
    schema: [],
    messages: {
      computedMissingReturn: 'computed() is missing a return value',
    },
  },
  defaultOptions: [],
  create(context) {
    const functionStack: {
      node: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
      hasReturn: boolean;
    }[] = [];

    function enterFunction(
      node: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ) {
      functionStack.push({
        node,
        hasReturn: false,
      });
    }

    function exitFunction(
      node: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ) {
      const funcInfo = functionStack.pop();

      if (
        node.parent?.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee.type === AST_NODE_TYPES.Identifier &&
        node.parent.callee.name === 'computed' &&
        node.parent.arguments[0] === node
      ) {
        // Arrow function without a body
        if (
          node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
          node.expression
        ) {
          return;
        }

        if (!funcInfo?.hasReturn) {
          context.report({
            node: node.parent,
            messageId: 'computedMissingReturn',
          });
        }
      }
    }

    return {
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,

      ReturnStatement(node: TSESTree.ReturnStatement) {
        if (node.argument && functionStack.length > 0) {
          functionStack[functionStack.length - 1].hasReturn = true;
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "`computed()` is used to transform signal values. If no value is returned from `computed()`, it's likely a mistake.",
};
