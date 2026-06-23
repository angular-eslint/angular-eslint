import {
  ASTUtils,
  isNotNullOrUndefined,
  RuleFixes,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferSignalModel';
export const RULE_NAME = 'prefer-signal-model';

/**
 * An `input()` or `output()` class member: the property declaration itself and
 * the explicit value type (`<T>`) of the call, if one was written.
 */
interface SignalDeclaration {
  readonly property: TSESTree.PropertyDefinition;
  readonly typeArgument: TSESTree.TypeNode | undefined;
}

/** An `input`/`output` pair that can be merged into a single `model()`. */
interface TwoWayBinding {
  readonly input: SignalDeclaration;
  readonly output: SignalDeclaration;
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
    schema: [],
    messages: {
      preferSignalModel:
        'Use `model` for two-way bindings instead of `input()` and `output()`',
    },
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;
    const inputs = new Map<string, SignalDeclaration>();
    const outputs = new Map<string, SignalDeclaration>();
    const services = ESLintUtils.getParserServices(context, true);
    const typeServices = services.program ? services : null;

    function collect(map: Map<string, SignalDeclaration>) {
      return (node: TSESTree.CallExpression) => {
        const property = node.parent as TSESTree.PropertyDefinition;
        map.set(ASTUtils.getPropertyDefinitionName(property), {
          property,
          typeArgument: node.typeArguments?.params[0],
        });
      };
    }

    /**
     * Whether the `input`/`output` types match, so the pair can become a single
     * `model()`. Compared semantically when type info is available, by text
     * otherwise; an inferred type on either side is assumed compatible.
     */
    function areTypesCompatible(
      input: SignalDeclaration,
      output: SignalDeclaration,
    ) {
      if (!input.typeArgument || !output.typeArgument) {
        return true;
      }

      if (typeServices) {
        return (
          typeServices.getTypeAtLocation(input.typeArgument) ===
          typeServices.getTypeAtLocation(output.typeArgument)
        );
      }

      return (
        sourceCode.getText(input.typeArgument) ===
        sourceCode.getText(output.typeArgument)
      );
    }

    return {
      "PropertyDefinition > CallExpression[callee.name='input']":
        collect(inputs),

      "PropertyDefinition > CallExpression[callee.name='output']":
        collect(outputs),

      'ClassDeclaration:exit'() {
        const twoWayBindings = [...inputs]
          .map(([name, input]) => ({
            input,
            output: outputs.get(`${name}Change`),
          }))
          .filter(
            (binding): binding is TwoWayBinding =>
              binding.output !== undefined &&
              areTypesCompatible(binding.input, binding.output),
          );

        for (const { input, output } of twoWayBindings) {
          context.report({
            node: input.property,
            messageId: 'preferSignalModel',
            fix: (fixer) => {
              const inputText = sourceCode.getText(input.property);
              const fixedInputText = inputText.replace(/\binput\b/, 'model');

              return [
                RuleFixes.getImportAddFix({
                  fixer,
                  importName: 'model',
                  moduleName: '@angular/core',
                  node: input.property,
                }),
                fixer.replaceText(input.property, fixedInputText),
                fixer.remove(output.property),
              ].filter(isNotNullOrUndefined);
            },
          });
        }

        // Clear the maps for the next class
        inputs.clear();
        outputs.clear();
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The model() function is Angular's modern API for two-way bindings, combining both input and output into a single signal. When you have an input property paired with an output property that follows the naming pattern of `propertyChange` (e.g., `enabled` input with `enabledChange` output), this is the traditional pattern for two-way binding. The model() function provides a cleaner, more concise way to express this pattern with better type safety and integration with Angular's signal ecosystem. It eliminates the boilerplate of managing separate input and output properties while maintaining the same two-way binding functionality.",
};
