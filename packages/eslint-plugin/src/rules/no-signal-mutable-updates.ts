import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { KNOWN_SIGNAL_TYPES } from '../utils/signals';

export type Options = [];
export type MessageIds =
  | 'noMutableSignalUpdate'
  | 'noMutableWritableSignalUpdate'
  | 'useSetOrUpdate';
export const RULE_NAME = 'no-signal-mutable-updates';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow mutable updates to signals. Signals should be read-only and WritableSignals should only be updated via .set() or .update() methods',
    },
    schema: [],
    messages: {
      noMutableSignalUpdate:
        'Cannot mutate a signal value. Signals are read-only and should not be updated directly',
      noMutableWritableSignalUpdate:
        'Cannot mutate a WritableSignal value directly. Use .set() or .update() methods to update the signal',
      useSetOrUpdate:
        'Use .set() or .update() methods to update WritableSignal values',
    },
  },
  defaultOptions: [],
  create(context) {
    const services: ParserServicesWithTypeInformation =
      ESLintUtils.getParserServices(context);

    function getSignalType(node: TSESTree.Node): string | undefined {
      const type = services.getTypeAtLocation(node);
      const typeName = type.getSymbol()?.name;
      return typeName && KNOWN_SIGNAL_TYPES.has(typeName)
        ? typeName
        : undefined;
    }

    function isSignalCallExpression(node: TSESTree.Node): boolean {
      // Check if this is a signal call like mySignal()
      if (node.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      // Signal calls have no arguments
      if (node.arguments.length > 0) {
        return false;
      }

      // Check if the callee is a signal
      const signalType = getSignalType(node.callee);
      return signalType !== undefined;
    }

    function findSignalCallInChain(
      node: TSESTree.MemberExpression,
    ): TSESTree.CallExpression | null {
      // Walk up the member expression chain to find a signal call
      let current: TSESTree.Node = node.object;

      while (current) {
        if (isSignalCallExpression(current)) {
          return current as TSESTree.CallExpression;
        }

        if (current.type === AST_NODE_TYPES.MemberExpression) {
          current = current.object;
        } else {
          break;
        }
      }

      return null;
    }

    return {
      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        // Check for signal().property = value or signal().nested.property = value
        if (node.left.type === AST_NODE_TYPES.MemberExpression) {
          const signalCall = findSignalCallInChain(node.left);

          if (signalCall) {
            const signalType = getSignalType(signalCall.callee);

            if (
              signalType === 'WritableSignal' ||
              signalType === 'ModelSignal'
            ) {
              context.report({
                node: node.left,
                messageId: 'noMutableWritableSignalUpdate',
              });
            } else if (signalType) {
              context.report({
                node: node.left,
                messageId: 'noMutableSignalUpdate',
              });
            }
          }
        }
      },

      UpdateExpression(node: TSESTree.UpdateExpression) {
        // Check for signal().property++ or ++signal().property
        if (node.argument.type === AST_NODE_TYPES.MemberExpression) {
          const signalCall = findSignalCallInChain(node.argument);

          if (signalCall) {
            const signalType = getSignalType(signalCall.callee);

            if (
              signalType === 'WritableSignal' ||
              signalType === 'ModelSignal'
            ) {
              context.report({
                node: node.argument,
                messageId: 'noMutableWritableSignalUpdate',
              });
            } else if (signalType) {
              context.report({
                node: node.argument,
                messageId: 'noMutableSignalUpdate',
              });
            }
          }
        }
      },

      'CallExpression[callee.type="MemberExpression"]'(
        node: TSESTree.CallExpression,
      ) {
        const callee = node.callee as TSESTree.MemberExpression;
        const object = callee.object;

        // Check for mutating methods on signal values
        // e.g., mySignal().push(), mySignal().pop(), etc.
        if (isSignalCallExpression(object)) {
          if (callee.property.type === AST_NODE_TYPES.Identifier) {
            const methodName = callee.property.name;
            const mutatingMethods = new Set([
              'push',
              'pop',
              'shift',
              'unshift',
              'splice',
              'sort',
              'reverse',
              'fill',
              'copyWithin',
            ]);

            if (mutatingMethods.has(methodName)) {
              const signalType = getSignalType(
                (object as TSESTree.CallExpression).callee,
              );

              if (
                signalType === 'WritableSignal' ||
                signalType === 'ModelSignal'
              ) {
                context.report({
                  node: callee,
                  messageId: 'useSetOrUpdate',
                });
              } else if (signalType) {
                context.report({
                  node: callee,
                  messageId: 'noMutableSignalUpdate',
                });
              }
            }
          }
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Angular signals are designed to be immutable references to reactive state. When you have a Signal (read-only), you should only read its value by calling it - never mutate the returned value. When you have a WritableSignal, you should update it only through the provided .set() and .update() methods, which properly notify the reactivity system of changes. Mutating signal values directly (like mySignal().property = value or mySignal().push(item)) breaks the reactivity system because Angular cannot detect these changes. This leads to bugs where the UI does not update when the underlying data changes. For WritableSignals, always use .set() to replace the entire value or .update() to compute a new value based on the current one. This ensures Angular tracks all changes and updates dependent computed signals and effects correctly.',
};
