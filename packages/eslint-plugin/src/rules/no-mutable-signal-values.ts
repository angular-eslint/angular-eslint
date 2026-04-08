import {
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} from '@typescript-eslint/utils/eslint-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getNameOfDeclaration,
  IndexKind,
  isPrivateIdentifier,
  Node,
  Symbol,
  SymbolFlags,
  Type,
} from 'typescript';
import { isSignal } from '../utils/signals';
import {
  isConditionalType,
  isIntersectionType,
  isObjectType,
  isPropertyReadonlyInType,
  isSymbolFlagSet,
  isTypeReference,
  isUnionType,
} from 'ts-api-utils';
import { TSESTree } from '@typescript-eslint/utils';
import {
  getTypeOfPropertyOfType,
  isTypeReadonly,
  typeMatchesSomeSpecifier,
} from '@typescript-eslint/type-utils';

export type Options = [{ immutableTypes?: string[] }];
export type MessageIds = 'noMutableSignalValues';
export const RULE_NAME = 'no-mutable-signal-values';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the type of a value stored in a signal is immutable',
    },
    schema: [
      {
        type: 'object',
        properties: {
          immutableTypes: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    ],
    messages: {
      noMutableSignalValues: 'Signals should only store immutable values',
    },
  },
  defaultOptions: [{}],
  create(context, [{ immutableTypes = [] }]) {
    const services = getParserServices(context);
    const program = services.program;
    const checker = program.getTypeChecker();
    const knownImmutability = new Map<Type, boolean | undefined>();

    function* getSignalValueTypes(type: Type): Iterable<Type> {
      const symbol = type.getSymbol();

      if (isSignal(type, symbol)) {
        const signalTypeArguments = isTypeReference(type)
          ? type.typeArguments
          : type.aliasTypeArguments;

        if (signalTypeArguments && signalTypeArguments.length > 0) {
          yield signalTypeArguments[0];
        } else if (type.isUnionOrIntersection()) {
          for (const part of type.types) {
            yield* getSignalValueTypes(part);
          }
        }
      }
    }

    function isImmutable(type: Type, visited?: Set<Type>): boolean | undefined {
      // This function and the functions that it calls are based heavily off
      // the logic in the `isTypeReadonly` function from `@typescript-eslint/type-utils`,
      // but with some modifications to handle readonly sets, maps and arrays, and signals.
      //
      // https://github.com/typescript-eslint/typescript-eslint/blob/366976c4b461c48c81f1e96aec52ad2bf2e2c6b0/packages/type-utils/src/isTypeReadonly.ts

      // If we have calculated the immutability of this
      // type before, return the cached result.
      if (knownImmutability.has(type)) {
        return knownImmutability.get(type);
      }

      if (visited) {
        // If we are in the process of calculating this type, then return
        // undefined because we don't know the final result at this point.
        if (visited.has(type)) {
          return undefined;
        }
      } else {
        visited = new Set();
      }

      const symbol = type.getSymbol();
      if (symbol) {
        if (
          symbol.name === 'ReadonlyMap' ||
          symbol.name === 'ReadonlySet' ||
          symbol.name === 'ReadonlyArray'
        ) {
          // These types are readonly if their type arguments are readonly.
          const result =
            isTypeReference(type) &&
            checker
              .getTypeArguments(type)
              .every((x) => isImmutable(x, visited));
          knownImmutability.set(type, result);
          return result;
        }
      }

      // If the type is a signal, then we will consider it immutable
      // because the signal cannot be replaced even though its value
      // can be changed. This allows signals to contain arrays of other
      // signals or objects that have properties that store signals.
      // We won't check the value type of this signal because that will
      // be checked separately when we check the signal itself.
      if (isSignal(type, symbol)) {
        knownImmutability.set(type, true);
        return true;
      }

      if (immutableTypes.length > 0) {
        // If the type has an alias symbol, check it against
        // the types that we have been told are immutable.
        if (type.aliasSymbol) {
          if (immutableTypes.includes(type.aliasSymbol.getName())) {
            knownImmutability.set(type, true);
            return true;
          }
        }

        if (typeMatchesSomeSpecifier(type, immutableTypes, program)) {
          knownImmutability.set(type, true);
          return true;
        }
      }

      if (isUnionType(type)) {
        // All types in a union must be immutable.
        const result = type.types.every(
          (t) => visited.has(t) || isImmutable(t, visited) === true,
        );
        knownImmutability.set(type, result);
        return result;
      }

      if (isIntersectionType(type)) {
        // Special case for handling arrays/tuples
        // (as readonly arrays/tuples always have mutable methods).
        if (
          type.types.some(
            (t) => checker.isArrayType(t) || checker.isTupleType(t),
          )
        ) {
          const allReadonlyParts = type.types.every(
            (t) => visited.has(t) || isImmutable(t, visited) === true,
          );
          knownImmutability.set(type, allReadonlyParts);
          return allReadonlyParts;
        }

        // Normal case.
        const result = isImmutableObject(type, visited);
        if (result !== undefined) {
          knownImmutability.set(type, result);
          return result;
        }
      }

      if (isConditionalType(type)) {
        const result = [type.root.node.trueType, type.root.node.falseType]
          .map(checker.getTypeFromTypeNode)
          .every((t) => visited.has(t) || isImmutable(t, visited) === true);

        knownImmutability.set(type, result);
        return result;
      }

      // All non-object, non-intersection types are readonly.
      // This should only be primitive types.
      if (!isObjectType(type)) {
        knownImmutability.set(type, true);
        return true;
      }

      // Pure function types are readonly.
      if (
        type.getCallSignatures().length > 0 &&
        type.getProperties().length === 0
      ) {
        knownImmutability.set(type, true);
        return true;
      }

      knownImmutability.set(type, false);
      return false;
    }

    function isImmutableObject(
      type: Type,
      visited: Set<Type>,
    ): boolean | undefined {
      function checkIndexSignature(kind: IndexKind): boolean | undefined {
        const indexInfo = checker.getIndexInfoOfType(type, kind);
        if (indexInfo) {
          if (!indexInfo.isReadonly) {
            return false;
          }

          if (indexInfo.type === type || visited.has(indexInfo.type)) {
            return true;
          }

          return isImmutable(indexInfo.type, visited);
        }

        return undefined;
      }

      const properties = type.getProperties();
      if (properties.length > 0) {
        // ensure the properties are marked as readonly
        for (const property of properties) {
          if (
            property.valueDeclaration != null &&
            hasSymbol(property.valueDeclaration) &&
            isSymbolFlagSet(
              property.valueDeclaration.symbol,
              SymbolFlags.Method,
            )
          ) {
            continue;
          }

          const declarations = property.getDeclarations();
          const lastDeclaration = declarations?.at(-1);
          if (
            lastDeclaration != null &&
            hasSymbol(lastDeclaration) &&
            isSymbolFlagSet(lastDeclaration.symbol, SymbolFlags.Method)
          ) {
            continue;
          }

          if (
            isPropertyReadonlyInType(type, property.getEscapedName(), checker)
          ) {
            continue;
          }

          const name = getNameOfDeclaration(property.valueDeclaration);
          if (name && isPrivateIdentifier(name)) {
            continue;
          }

          return false;
        }

        // all properties were readonly
        // now ensure that all of the values are readonly also.

        // do this after checking property readonly-ness as a perf optimization,
        // as we might be able to bail out early due to a mutable property before
        // doing this deep, potentially expensive check.
        for (const property of properties) {
          const propertyType = nullThrows(
            getTypeOfPropertyOfType(checker, type, property),
            NullThrowsReasons.MissingToken(
              `property "${property.name}"`,
              'type',
            ),
          );

          // handle recursive types.
          // we only need this simple check, because a mutable recursive type will break via the above prop readonly check
          if (visited.has(propertyType)) {
            continue;
          }

          if (isImmutable(propertyType, visited) === false) {
            return false;
          }
        }
      }

      const isStringIndexSigReadonly = checkIndexSignature(IndexKind.String);
      if (isStringIndexSigReadonly === false) {
        return false;
      }

      const isNumberIndexSigReadonly = checkIndexSignature(IndexKind.Number);
      if (isNumberIndexSigReadonly === false) {
        return false;
      }

      return true;
    }

    function hasSymbol(node: Node): node is { symbol: Symbol } & Node {
      return Object.hasOwn(node, 'symbol');
    }

    return {
      Identifier(node) {
        switch (node.parent.type) {
          case TSESTree.AST_NODE_TYPES.ImportSpecifier:
          case TSESTree.AST_NODE_TYPES.TSTypeReference:
            return;
        }

        const type = services.getTypeAtLocation(node);
        for (const valueType of getSignalValueTypes(type)) {
          if (
            !isTypeReadonly(program, valueType, {
              allow: immutableTypes,
              treatMethodsAsReadonly: true,
            })
          ) {
            // if (!isImmutable(valueType)) {
            // If the identifier has a type annotation, then report the
            // problem on that. If it doesn't, then see if we can find where
            // the associated type annotation is. If we can't find a type
            // annotation, then we'll just report the problem on the identifier.
            let typeNode = node.typeAnnotation?.typeAnnotation;
            if (!typeNode) {
              switch (node.parent.type) {
                case TSESTree.AST_NODE_TYPES.TSPropertySignature:
                  typeNode = node.parent.typeAnnotation?.typeAnnotation;
                  break;
                case TSESTree.AST_NODE_TYPES.PropertyDefinition:
                  typeNode = node.parent.typeAnnotation?.typeAnnotation;
                  break;
              }
            }
            context.report({
              node: typeNode ?? node,
              messageId: 'noMutableSignalValues',
            });
          }
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `Signal values should only be updated using the \`.set(value)\` or \`.update(callback)\` methods. Storing a mutable value in a signal allows it to be updated directly, which breaks the signal's change detection.`,
};
