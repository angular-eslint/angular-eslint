import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESLint,
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
  | 'useSetOrUpdate'
  | 'useImmutableUpdate';
export const RULE_NAME = 'no-signal-mutable-updates';

const ARRAY_MUTATING_METHODS = new Set([
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

const MAP_MUTATING_METHODS = new Set(['set', 'delete', 'clear']);
const SET_MUTATING_METHODS = new Set(['add', 'delete', 'clear']);

const KNOWN_MUTABLE_OBJECT_TYPES = new Set([
  'Date',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
]);

type SignalDerivedInfo = {
  signalCall: TSESTree.CallExpression;
  signalType: string;
  valueType: ts.Type;
  isUpdateCallbackParam?: boolean;
};

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
      useImmutableUpdate:
        'Do not mutate the signal value inside .update(). Return a new immutable value instead (e.g. use spread syntax: [...current, item] instead of current.push(item))',
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

    // Track variables that hold signal-derived values, keyed by the resolved
    // scope-manager Variable identity rather than by name. This keeps separate
    // bindings (e.g. two `arr`s in different functions) from clobbering each
    // other and makes lookups robust against scoping.
    const signalDerivedVariables = new WeakMap<
      TSESLint.Scope.Variable,
      SignalDerivedInfo
    >();

    function isWritableSignalType(signalType: string): boolean {
      return signalType === 'WritableSignal' || signalType === 'ModelSignal';
    }

    function getResolvedVariable(
      idNode: TSESTree.Identifier,
    ): TSESLint.Scope.Variable | null {
      let scope: TSESLint.Scope.Scope | null =
        context.sourceCode.getScope(idNode);
      while (scope) {
        for (const ref of scope.references) {
          if (ref.identifier === idNode) {
            return ref.resolved;
          }
        }
        scope = scope.upper;
      }
      return null;
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

    function getSignalDerivedInfo(
      node: TSESTree.Node,
    ): SignalDerivedInfo | null {
      if (node.type !== AST_NODE_TYPES.Identifier) {
        return null;
      }
      const variable = getResolvedVariable(node);
      if (!variable) return null;
      return signalDerivedVariables.get(variable) ?? null;
    }

    function getSignalUsageInfo(node: TSESTree.Node): {
      signalType: string;
      valueType: ts.Type;
    } | null {
      if (isSignalCallExpression(node)) {
        return getSignalInfo(node.callee) ?? null;
      }

      return getSignalDerivedInfo(node);
    }

    // Walks the `.object` chain of a MemberExpression looking for the source
    // of the value being mutated. Returns either a direct signal call found
    // somewhere in the chain (e.g. `signal().a.b = x`) or signal-derived info
    // for a leaf identifier (e.g. `arr[0].a = x` where `arr = signal()`).
    function findSignalSourceInChain(
      node: TSESTree.MemberExpression,
    ):
      | { kind: 'call'; signalType: string }
      | { kind: 'derived'; info: SignalDerivedInfo }
      | null {
      let current: TSESTree.Node = node.object;
      while (current) {
        if (isSignalCallExpression(current)) {
          const signalType = getSignalType(current.callee);
          return signalType ? { kind: 'call', signalType } : null;
        }
        if (current.type === AST_NODE_TYPES.Identifier) {
          const info = getSignalDerivedInfo(current);
          return info ? { kind: 'derived', info } : null;
        }
        if (current.type === AST_NODE_TYPES.MemberExpression) {
          current = current.object;
          continue;
        }
        return null;
      }
      return null;
    }

    function reportChainMutation(
      reportNode: TSESTree.Node,
      source: NonNullable<ReturnType<typeof findSignalSourceInChain>>,
    ): void {
      if (source.kind === 'call') {
        context.report({
          node: reportNode,
          messageId: isWritableSignalType(source.signalType)
            ? 'noMutableWritableSignalUpdate'
            : 'noMutableSignalUpdate',
        });
        return;
      }
      const { info } = source;
      if (info.isUpdateCallbackParam) {
        context.report({
          node: reportNode,
          messageId: 'useImmutableUpdate',
        });
      } else if (isWritableSignalType(info.signalType)) {
        context.report({
          node: reportNode,
          messageId: 'noMutableWritableSignalUpdate',
        });
      } else {
        context.report({
          node: reportNode,
          messageId: 'noMutableSignalUpdate',
        });
      }
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

    function isDirectParamReference(
      node: TSESTree.Expression | TSESTree.SpreadElement | null | undefined,
      paramName: string,
    ): boolean {
      if (!node) return false;
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          return node.name === paramName;
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
        case AST_NODE_TYPES.TSNonNullExpression:
          return isDirectParamReference(
            (
              node as
                | TSESTree.TSAsExpression
                | TSESTree.TSTypeAssertion
                | TSESTree.TSNonNullExpression
            ).expression,
            paramName,
          );
        default:
          return false;
      }
    }

    function collectReturnStatements(
      node: TSESTree.Node,
      results: TSESTree.ReturnStatement[],
    ): void {
      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.FunctionExpression ||
        node.type === AST_NODE_TYPES.ArrowFunctionExpression
      ) {
        return;
      }
      if (node.type === AST_NODE_TYPES.ReturnStatement) {
        results.push(node);
        return;
      }
      for (const key of Object.keys(node)) {
        if (
          key === 'parent' ||
          key === 'type' ||
          key === 'loc' ||
          key === 'range' ||
          key === 'start' ||
          key === 'end'
        ) {
          continue;
        }
        const child = (node as unknown as Record<string, unknown>)[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            for (const item of child) {
              if (item && typeof item === 'object' && 'type' in item) {
                collectReturnStatements(item as TSESTree.Node, results);
              }
            }
          } else if ('type' in (child as Record<string, unknown>)) {
            collectReturnStatements(child as TSESTree.Node, results);
          }
        }
      }
    }

    // Heuristic: an `.update(param => ...)` callback that returns `param`
    // directly (without spreading/copying) is presumed to be relying on
    // in-place mutation. We flag mutations inside such callbacks. `some()`
    // (not `every()`) is intentional: if at least one branch returns the
    // raw param while another returns a fresh copy, the raw branch breaks
    // reactivity, so the callback is still considered mutation-based.
    function callbackReturnsParamDirectly(
      callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      paramName: string,
    ): boolean {
      if (callback.body.type !== AST_NODE_TYPES.BlockStatement) {
        return isDirectParamReference(
          callback.body as TSESTree.Expression,
          paramName,
        );
      }
      const returns: TSESTree.ReturnStatement[] = [];
      collectReturnStatements(callback.body, returns);
      return returns.some((ret) =>
        isDirectParamReference(ret.argument, paramName),
      );
    }

    function getMutatingMethodsForType(type: ts.Type): ReadonlySet<string> {
      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        return ARRAY_MUTATING_METHODS;
      }
      const typeName = type.getSymbol()?.getName() ?? type.aliasSymbol?.name;
      if (typeName === 'Map' || typeName === 'WeakMap') {
        return MAP_MUTATING_METHODS;
      }
      if (typeName === 'Set' || typeName === 'WeakSet') {
        return SET_MUTATING_METHODS;
      }
      // Fallback: be conservative and only flag well-known array-mutating
      // names, which has been the rule's historical behaviour.
      return ARRAY_MUTATING_METHODS;
    }

    function checkMutableSignalArgumentEscape(
      node: TSESTree.CallExpression,
    ): void {
      node.arguments.forEach((argument, index) => {
        if (argument.type === AST_NODE_TYPES.SpreadElement) {
          return;
        }

        const signalUsage = getSignalUsageInfo(argument);
        if (!signalUsage || !isMutableType(signalUsage.valueType)) {
          return;
        }

        const expectedArgumentType = getExpectedArgumentType(node, index);
        if (!expectedArgumentType || !isMutableType(expectedArgumentType)) {
          return;
        }

        context.report({
          node: argument,
          messageId: isWritableSignalType(signalUsage.signalType)
            ? 'useSetOrUpdate'
            : 'noMutableSignalUpdate',
        });
      });
    }

    function trackVariableFromSignalCall(
      idNode: TSESTree.Identifier,
      signalCall: TSESTree.CallExpression,
    ): void {
      const variable = getResolvedVariable(idNode);
      if (!variable) return;
      const signalInfo = getSignalInfo(signalCall.callee);
      if (signalInfo) {
        signalDerivedVariables.set(variable, {
          signalCall,
          signalType: signalInfo.signalType,
          valueType: signalInfo.valueType,
        });
      } else {
        // Defensive: if the call doesn't resolve to a signal we shouldn't
        // keep any stale tracking around for this variable.
        signalDerivedVariables.delete(variable);
      }
    }

    function clearVariableTracking(idNode: TSESTree.Identifier): void {
      const variable = getResolvedVariable(idNode);
      if (variable) signalDerivedVariables.delete(variable);
    }

    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        // Track variables assigned from signal calls
        // const arr = mySignal()
        if (
          node.init &&
          node.id.type === AST_NODE_TYPES.Identifier &&
          isSignalCallExpression(node.init)
        ) {
          trackVariableFromSignalCall(node.id, node.init);
        }
      },

      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        // Track or untrack variables based on assignment.
        if (node.left.type === AST_NODE_TYPES.Identifier) {
          if (node.operator === '=' && isSignalCallExpression(node.right)) {
            // arr = mySignal()
            trackVariableFromSignalCall(node.left, node.right);
          } else {
            // arr = something_else  /  arr += 1  -> the variable no longer
            // holds the signal-derived value, so drop any stale tracking.
            clearVariableTracking(node.left);
          }
          return;
        }

        // Check for signal().property = value, signal().nested.property = value,
        // or indirect chained mutations like arr[0].name = value when arr was
        // derived from a signal call.
        if (node.left.type === AST_NODE_TYPES.MemberExpression) {
          const source = findSignalSourceInChain(node.left);
          if (source) {
            reportChainMutation(node.left, source);
          }
        }
      },

      UpdateExpression(node: TSESTree.UpdateExpression) {
        // Check for signal().property++ or arr[0].count++ etc.
        if (node.argument.type === AST_NODE_TYPES.MemberExpression) {
          const source = findSignalSourceInChain(node.argument);
          if (source) {
            reportChainMutation(node.argument, source);
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        // Detect signal.update((param) => { ... }) and track the callback
        // parameter as a signal-derived variable within the callback scope.
        // Using Variable identity (not name) means same-named params in
        // unrelated callbacks don't conflict and require no explicit cleanup.
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.property.type === AST_NODE_TYPES.Identifier &&
          node.callee.property.name === 'update' &&
          node.arguments.length >= 1
        ) {
          const updateCallee = node.callee;
          const signalInfo = getSignalInfo(updateCallee.object);
          if (signalInfo && isWritableSignalType(signalInfo.signalType)) {
            const callback = node.arguments[0];
            if (
              (callback.type === AST_NODE_TYPES.ArrowFunctionExpression ||
                callback.type === AST_NODE_TYPES.FunctionExpression) &&
              callback.params.length >= 1 &&
              callback.params[0].type === AST_NODE_TYPES.Identifier
            ) {
              const paramIdentifier = callback.params[0] as TSESTree.Identifier;
              if (
                callbackReturnsParamDirectly(callback, paramIdentifier.name)
              ) {
                const callbackScope = context.sourceCode.getScope(callback);
                const paramVariable = callbackScope.variables.find(
                  (v) => v.name === paramIdentifier.name,
                );
                if (paramVariable) {
                  signalDerivedVariables.set(paramVariable, {
                    signalCall: node,
                    signalType: signalInfo.signalType,
                    valueType: signalInfo.valueType,
                    isUpdateCallbackParam: true,
                  });
                }
              }
            }
          }
        }

        checkMutableSignalArgumentEscape(node);

        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const callee = node.callee;
        const object = callee.object;
        if (callee.property.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const methodName = callee.property.name;

        // Check for mutating methods on signal values
        // e.g., mySignal().push(), mySignal().myMap.set(...), etc.
        if (isSignalCallExpression(object)) {
          const signalInfo = getSignalInfo(object.callee);
          if (!signalInfo) return;
          if (
            !getMutatingMethodsForType(signalInfo.valueType).has(methodName)
          ) {
            return;
          }
          context.report({
            node: callee,
            messageId: isWritableSignalType(signalInfo.signalType)
              ? 'useSetOrUpdate'
              : 'noMutableSignalUpdate',
          });
          return;
        }

        // Check for indirect mutation on a signal-derived variable:
        // arr.push() where arr came from signal(), or chained shapes like
        // arr[0].push() where arr is the signal-derived array of arrays.
        let derived: SignalDerivedInfo | null = null;
        if (object.type === AST_NODE_TYPES.Identifier) {
          derived = getSignalDerivedInfo(object);
        } else if (object.type === AST_NODE_TYPES.MemberExpression) {
          const source = findSignalSourceInChain(object);
          if (source?.kind === 'derived') derived = source.info;
        }
        if (!derived) return;
        if (!getMutatingMethodsForType(derived.valueType).has(methodName)) {
          return;
        }
        if (derived.isUpdateCallbackParam) {
          context.report({
            node: callee,
            messageId: 'useImmutableUpdate',
          });
        } else if (isWritableSignalType(derived.signalType)) {
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
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Angular signals are designed to be immutable references to reactive state. When you have a read-only signal (`Signal`, `InputSignal`, `InputSignalWithTransform`), you should only read its value by calling it - never mutate the returned value. When you have a `WritableSignal` or `ModelSignal`, you should update it only through the provided `.set()` and `.update()` methods, which properly notify the reactivity system of changes. Mutating signal values directly (like `mySignal().property = value` or `mySignal().push(item)`) breaks the reactivity system because Angular cannot detect these changes. This leads to bugs where the UI does not update when the underlying data changes. For `WritableSignal`s, always use `.set()` to replace the entire value or `.update()` to compute a new value based on the current one. This ensures Angular tracks all changes and updates dependent computed signals and effects correctly.',
};
