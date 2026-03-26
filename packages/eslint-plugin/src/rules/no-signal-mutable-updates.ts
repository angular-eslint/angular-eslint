import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import ts from 'typescript';
import * as tsutils from 'ts-api-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { KNOWN_SIGNAL_TYPES } from '../utils/signals';

export type Options = [];
export type MessageIds =
  | 'noMutableSignalUpdate'
  | 'noMutableWritableSignalUpdate'
  | 'useSetOrUpdate';
export const RULE_NAME = 'no-signal-mutable-updates';

const MUTATING_METHODS = new Set([
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

const KNOWN_MUTABLE_OBJECT_TYPES = new Set([
  'Date',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
]);

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
    const checker = services.program.getTypeChecker();
    const tsSourceFile = services.esTreeNodeToTSNodeMap.get(
      context.sourceCode.ast,
    );

    // Track variables that hold signal-derived values
    // Map from variable name to the signal call node, signal type and value type
    const signalDerivedVariables = new Map<
      string,
      {
        signalCall: TSESTree.CallExpression;
        signalType: string;
        valueType: ts.Type;
      }
    >();

    function isWritableSignalType(signalType: string): boolean {
      return signalType === 'WritableSignal' || signalType === 'ModelSignal';
    }

    function getSignalInfo(
      node: TSESTree.Node,
    ): { signalType: string; valueType: ts.Type } | undefined {
      const type = services.getTypeAtLocation(node);
      const typeName = type.getSymbol()?.name ?? type.aliasSymbol?.name;
      if (!typeName || !KNOWN_SIGNAL_TYPES.has(typeName)) {
        return undefined;
      }

      const [callSignature] = checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Call,
      );
      const valueType = callSignature?.getReturnType();

      if (!valueType) {
        return undefined;
      }

      return { signalType: typeName, valueType };
    }

    function getSignalType(node: TSESTree.Node): string | undefined {
      return getSignalInfo(node)?.signalType;
    }

    function isSignalCallExpression(
      node: TSESTree.Node,
    ): node is TSESTree.CallExpression {
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

    function getVariableName(node: TSESTree.Node): string | null {
      if (node.type === AST_NODE_TYPES.Identifier) {
        return node.name;
      }
      return null;
    }

    function isSignalDerivedVariable(node: TSESTree.Node): {
      signalCall: TSESTree.CallExpression;
      signalType: string;
      valueType: ts.Type;
    } | null {
      const varName = getVariableName(node);
      if (!varName) return null;
      return signalDerivedVariables.get(varName) || null;
    }

    function getSignalUsageInfo(node: TSESTree.Node): {
      signalType: string;
      valueType: ts.Type;
    } | null {
      if (isSignalCallExpression(node)) {
        return getSignalInfo(node.callee) ?? null;
      }

      return isSignalDerivedVariable(node);
    }

    function isDeclarationFileSignature(signature: ts.Signature): boolean {
      return (
        signature.getDeclaration()?.getSourceFile().isDeclarationFile ?? true
      );
    }

    function getExpectedArgumentType(
      node: TSESTree.CallExpression,
      argumentIndex: number,
    ): ts.Type | null {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const signature = checker.getResolvedSignature(tsNode);

      if (!signature || isDeclarationFileSignature(signature)) {
        return null;
      }

      const declaration = signature.getDeclaration();
      const parameters = signature.getParameters();

      if (!declaration || parameters.length === 0) {
        return null;
      }

      const parameterIndex = Math.min(argumentIndex, parameters.length - 1);
      const parameter = parameters[parameterIndex];
      const parameterDeclaration = parameter.valueDeclaration;
      let parameterType =
        parameterDeclaration &&
        ts.isParameter(parameterDeclaration) &&
        parameterDeclaration.type
          ? checker.getTypeFromTypeNode(parameterDeclaration.type)
          : checker.getTypeOfSymbolAtLocation(parameter, declaration);

      if (
        parameterDeclaration &&
        ts.isParameter(parameterDeclaration) &&
        parameterDeclaration.dotDotDotToken
      ) {
        const typeArguments = checker.getTypeArguments(
          parameterType as ts.TypeReference,
        );
        parameterType = typeArguments[0] ?? parameterType;
      }

      return parameterType;
    }

    function isMutableType(
      type: ts.Type,
      seenTypes: Set<ts.Type> = new Set(),
    ): boolean {
      if (seenTypes.has(type)) {
        return false;
      }
      seenTypes.add(type);

      if (type.isUnionOrIntersection()) {
        return type.types.some((part) => isMutableType(part, seenTypes));
      }

      if (type.flags & ts.TypeFlags.TypeParameter) {
        const constraint = checker.getBaseConstraintOfType(type);
        return constraint ? isMutableType(constraint, seenTypes) : false;
      }

      if (
        type.flags &
        (ts.TypeFlags.Any |
          ts.TypeFlags.Unknown |
          ts.TypeFlags.Never |
          ts.TypeFlags.Void |
          ts.TypeFlags.Undefined |
          ts.TypeFlags.Null |
          ts.TypeFlags.BooleanLike |
          ts.TypeFlags.NumberLike |
          ts.TypeFlags.StringLike |
          ts.TypeFlags.BigIntLike |
          ts.TypeFlags.EnumLike |
          ts.TypeFlags.ESSymbolLike)
      ) {
        return false;
      }

      const typeSymbolName =
        type.getSymbol()?.getName() ?? type.aliasSymbol?.name;
      if (typeSymbolName && KNOWN_MUTABLE_OBJECT_TYPES.has(typeSymbolName)) {
        return true;
      }

      if (checker.isTupleType(type)) {
        const tupleType = type as ts.TupleTypeReference;
        return (
          !tupleType.target.readonly ||
          checker
            .getTypeArguments(tupleType)
            .some((part) => isMutableType(part, seenTypes))
        );
      }

      if (checker.isArrayType(type)) {
        const typeArguments = checker.getTypeArguments(
          type as ts.TypeReference,
        );
        return (
          typeSymbolName !== 'ReadonlyArray' ||
          typeArguments.some((part) => isMutableType(part, seenTypes))
        );
      }

      if (
        type.getCallSignatures().length > 0 &&
        type.getProperties().length === 0 &&
        checker.getIndexInfosOfType(type).length === 0
      ) {
        return false;
      }

      const apparentType = checker.getApparentType(type);

      for (const indexInfo of checker.getIndexInfosOfType(apparentType)) {
        if (!indexInfo.isReadonly || isMutableType(indexInfo.type, seenTypes)) {
          return true;
        }
      }

      for (const property of apparentType.getProperties()) {
        if (property.flags & ts.SymbolFlags.Method) {
          continue;
        }

        if (
          !tsutils.isPropertyReadonlyInType(
            apparentType,
            property.getEscapedName(),
            checker,
          )
        ) {
          return true;
        }

        const propertyDeclaration =
          property.valueDeclaration ??
          property.declarations?.[0] ??
          apparentType.symbol?.valueDeclaration ??
          apparentType.symbol?.declarations?.[0] ??
          tsSourceFile;

        const propertyType = checker.getTypeOfSymbolAtLocation(
          property,
          propertyDeclaration,
        );

        if (isMutableType(propertyType, seenTypes)) {
          return true;
        }
      }

      return false;
    }

    function checkMutableSignalArgumentEscape(
      node: TSESTree.CallExpression,
    ): void {
      node.arguments.forEach((argument, index) => {
        if (argument.type === AST_NODE_TYPES.SpreadElement) {
          return;
        }

        const signalUsage = getSignalUsageInfo(argument);
        if (
          !signalUsage ||
          !isWritableSignalType(signalUsage.signalType) ||
          !isMutableType(signalUsage.valueType)
        ) {
          return;
        }

        const expectedArgumentType = getExpectedArgumentType(node, index);
        if (!expectedArgumentType || !isMutableType(expectedArgumentType)) {
          return;
        }

        context.report({
          node: argument,
          messageId: 'useSetOrUpdate',
        });
      });
    }

    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        // Track variables assigned from signal calls
        // const arr = mySignal()
        if (
          node.init &&
          isSignalCallExpression(node.init) &&
          node.id.type === AST_NODE_TYPES.Identifier
        ) {
          const signalInfo = getSignalInfo(
            (node.init as TSESTree.CallExpression).callee,
          );
          if (signalInfo) {
            signalDerivedVariables.set(node.id.name, {
              signalCall: node.init as TSESTree.CallExpression,
              signalType: signalInfo.signalType,
              valueType: signalInfo.valueType,
            });
          }
        }
      },

      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        // Track variables assigned from signal calls in assignment expressions
        // arr = mySignal()
        if (
          node.left.type === AST_NODE_TYPES.Identifier &&
          isSignalCallExpression(node.right)
        ) {
          const signalInfo = getSignalInfo(
            (node.right as TSESTree.CallExpression).callee,
          );
          if (signalInfo) {
            signalDerivedVariables.set(node.left.name, {
              signalCall: node.right as TSESTree.CallExpression,
              signalType: signalInfo.signalType,
              valueType: signalInfo.valueType,
            });
          }
          return;
        }

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
            return;
          }

          // Check for indirect mutation: arr[0] = value where arr came from signal()
          const signalDerived = isSignalDerivedVariable(node.left.object);
          if (signalDerived) {
            if (
              signalDerived.signalType === 'WritableSignal' ||
              signalDerived.signalType === 'ModelSignal'
            ) {
              context.report({
                node: node.left,
                messageId: 'noMutableWritableSignalUpdate',
              });
            } else {
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
            return;
          }

          // Check for indirect mutation: arr[0]++ where arr came from signal()
          const signalDerived = isSignalDerivedVariable(node.argument.object);
          if (signalDerived) {
            if (
              signalDerived.signalType === 'WritableSignal' ||
              signalDerived.signalType === 'ModelSignal'
            ) {
              context.report({
                node: node.argument,
                messageId: 'noMutableWritableSignalUpdate',
              });
            } else {
              context.report({
                node: node.argument,
                messageId: 'noMutableSignalUpdate',
              });
            }
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        checkMutableSignalArgumentEscape(node);

        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const callee = node.callee;
        const object = callee.object;

        // Check for mutating methods on signal values
        // e.g., mySignal().push(), mySignal().pop(), etc.
        if (isSignalCallExpression(object)) {
          if (callee.property.type === AST_NODE_TYPES.Identifier) {
            const methodName = callee.property.name;
            if (MUTATING_METHODS.has(methodName)) {
              const signalType = getSignalType(
                (object as TSESTree.CallExpression).callee,
              );

              if (signalType && isWritableSignalType(signalType)) {
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
          return;
        }

        // Check for indirect mutation: arr.push() where arr came from signal()
        const signalDerived = isSignalDerivedVariable(object);
        if (
          signalDerived &&
          callee.property.type === AST_NODE_TYPES.Identifier
        ) {
          const methodName = callee.property.name;
          if (MUTATING_METHODS.has(methodName)) {
            if (isWritableSignalType(signalDerived.signalType)) {
              context.report({
                node: callee,
                messageId: 'useSetOrUpdate',
              });
            } else {
              context.report({
                node: callee,
                messageId: 'noMutableSignalUpdate',
              });
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
