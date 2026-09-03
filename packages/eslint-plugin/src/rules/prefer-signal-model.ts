import {
  ASTUtils,
  isNotNullOrUndefined,
  RuleFixes,
} from '@angular-eslint/utils';
import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    useTypeChecking: boolean;
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  useTypeChecking: false,
};

export type MessageIds = 'preferSignalModel';
export const RULE_NAME = 'prefer-signal-model';

interface SignalDeclaration {
  readonly property: TSESTree.PropertyDefinition;
  readonly callee: TSESTree.Identifier;
  readonly typeArgument: TSESTree.TypeNode | undefined;
  readonly initialValue: TSESTree.CallExpressionArgument | undefined;
}

interface TwoWayBinding {
  readonly input: SignalDeclaration;
  readonly output: SignalDeclaration;
}

function hasTransformOption(
  options: TSESTree.CallExpressionArgument | undefined,
) {
  return (
    options?.type === AST_NODE_TYPES.ObjectExpression &&
    options.properties.some(
      (property) =>
        property.type === AST_NODE_TYPES.Property &&
        ((property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === 'transform') ||
          (property.key.type === AST_NODE_TYPES.Literal &&
            property.key.value === 'transform')),
    )
  );
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use `model` instead of `input` and `output` for two-way bindings',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          useTypeChecking: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.useTypeChecking,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferSignalModel:
        'Use `model` for two-way bindings instead of `input()` and `output()`',
    },
  },
  defaultOptions: [{ ...DEFAULT_OPTIONS }],
  create(context, [{ useTypeChecking = DEFAULT_OPTIONS.useTypeChecking }]) {
    const { sourceCode } = context;
    const inputs = new Map<string, SignalDeclaration>();
    const outputs = new Map<string, SignalDeclaration>();
    let services: ParserServicesWithTypeInformation | undefined;

    function getTypeServices() {
      return (services ??= ESLintUtils.getParserServices(context));
    }

    function createSignalCollector(
      signals: Map<string, SignalDeclaration>,
      { hasInitialValueArgument }: { hasInitialValueArgument: boolean },
    ) {
      return (node: TSESTree.CallExpression) => {
        const options = node.arguments[hasInitialValueArgument ? 1 : 0];

        // `model()` has no transform support.
        // https://github.com/angular/angular/issues/55166#issuecomment-2032150999
        if (hasTransformOption(options)) {
          return;
        }

        const property = node.parent as TSESTree.PropertyDefinition;
        signals.set(ASTUtils.getPropertyDefinitionName(property), {
          property,
          callee: (node.callee.type === AST_NODE_TYPES.MemberExpression
            ? node.callee.object
            : node.callee) as TSESTree.Identifier,
          typeArgument: node.typeArguments?.params[0],
          initialValue: hasInitialValueArgument ? node.arguments[0] : undefined,
        });
      };
    }

    function getValueType({ typeArgument, initialValue }: SignalDeclaration) {
      const typeServices = getTypeServices();

      if (typeArgument) {
        return typeServices.getTypeAtLocation(typeArgument);
      }

      if (initialValue) {
        return typeServices.program
          .getTypeChecker()
          .getBaseTypeOfLiteralType(
            typeServices.getTypeAtLocation(initialValue),
          );
      }

      return undefined;
    }

    function haveEquallyWrittenTypes(
      input: SignalDeclaration,
      output: SignalDeclaration,
    ) {
      return (
        !input.typeArgument ||
        !output.typeArgument ||
        sourceCode.getText(input.typeArgument) ===
          sourceCode.getText(output.typeArgument)
      );
    }

    function haveMergeableTypes(
      input: SignalDeclaration,
      output: SignalDeclaration,
    ) {
      if (!useTypeChecking) {
        return haveEquallyWrittenTypes(input, output);
      }

      const inputType = getValueType(input);
      const outputType = getValueType(output);

      if (!inputType || !outputType) {
        return true;
      }

      // A type argument that does not resolve becomes the error type, which is
      // assignable in both directions, so only the written text is trustworthy.
      if ((inputType.flags | outputType.flags) & ts.TypeFlags.Any) {
        return haveEquallyWrittenTypes(input, output);
      }

      // Mutual assignability stands in for the internal `isTypeIdenticalTo`;
      // the same type written twice yields two distinct `ts.Type` objects.
      const checker = getTypeServices().program.getTypeChecker();
      return (
        checker.isTypeAssignableTo(inputType, outputType) &&
        checker.isTypeAssignableTo(outputType, inputType)
      );
    }

    return {
      "PropertyDefinition > CallExpression[callee.name='input']":
        createSignalCollector(inputs, { hasInitialValueArgument: true }),

      "PropertyDefinition > CallExpression[callee.object.name='input'][callee.property.name='required']":
        createSignalCollector(inputs, { hasInitialValueArgument: false }),

      "PropertyDefinition > CallExpression[callee.name='output']":
        createSignalCollector(outputs, { hasInitialValueArgument: false }),

      'ClassDeclaration:exit'() {
        const twoWayBindings = [...inputs]
          .map(([name, input]) => ({
            input,
            output: outputs.get(`${name}Change`),
          }))
          .filter(
            (binding): binding is TwoWayBinding =>
              binding.output !== undefined &&
              haveMergeableTypes(binding.input, binding.output),
          );

        for (const { input, output } of twoWayBindings) {
          context.report({
            node: input.property,
            messageId: 'preferSignalModel',
            fix: (fixer) =>
              [
                RuleFixes.getImportAddFix({
                  fixer,
                  importName: 'model',
                  moduleName: '@angular/core',
                  node: input.property,
                }),
                fixer.replaceText(input.callee, 'model'),
                fixer.remove(output.property),
              ].filter(isNotNullOrUndefined),
          });
        }

        inputs.clear();
        outputs.clear();
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The model() function is Angular's modern API for two-way bindings, combining both input and output into a single signal. When you have an input property paired with an output property that follows the naming pattern of `propertyChange` (e.g., `enabled` input with `enabledChange` output), this is the traditional pattern for two-way binding. The model() function provides a cleaner, more concise way to express this pattern with better type safety and integration with Angular's signal ecosystem. It eliminates the boilerplate of managing separate input and output properties while maintaining the same two-way binding functionality.\n\nBecause `model()` exposes a single type for both directions, only pairs whose `input` and `output` types match are reported. By default the written type arguments are compared as text, and a pair is assumed compatible when either side has no type argument. Enabling the `useTypeChecking` option compares the types semantically instead, and infers an `input`'s type from its initial value, so `input('')` paired with `output<number>()` is left alone. A type argument that does not resolve falls back to the text comparison.",
};
