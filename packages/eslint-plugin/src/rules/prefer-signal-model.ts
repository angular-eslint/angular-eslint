import {
  ASTUtils,
  isNotNullOrUndefined,
  RuleFixes,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferSignalModel';
export const RULE_NAME = 'prefer-signal-model';

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
    const inputs = new Map<string, TSESTree.PropertyDefinition>();
    const outputs = new Map<string, TSESTree.PropertyDefinition>();

    return {
      "PropertyDefinition > CallExpression[callee.name='input']"(
        node: TSESTree.CallExpression,
      ) {
        const propertyDef = node.parent as TSESTree.PropertyDefinition;
        const propertyName = ASTUtils.getPropertyDefinitionName(propertyDef);

        inputs.set(propertyName, propertyDef);
      },

      "PropertyDefinition > CallExpression[callee.name='output']"(
        node: TSESTree.CallExpression,
      ) {
        const propertyDef = node.parent as TSESTree.PropertyDefinition;
        const propertyName = ASTUtils.getPropertyDefinitionName(propertyDef);
        outputs.set(propertyName, propertyDef);
      },

      'ClassDeclaration:exit'() {
        for (const [inputName, inputProperty] of inputs) {
          const outputName = `${inputName}Change`;
          const outputProperty = outputs.get(outputName);

          if (outputProperty) {
            // Report on the input property
            context.report({
              node: inputProperty,
              messageId: 'preferSignalModel',
              fix: (fixer) => {
                const sourceCode = context.sourceCode;
                const inputText = sourceCode.getText(inputProperty);
                const fixedInputText = inputText.replace(/\binput\b/, 'model');

                return [
                  RuleFixes.getImportAddFix({
                    fixer,
                    importName: 'model',
                    moduleName: '@angular/core',
                    node: inputProperty,
                  }),
                  fixer.replaceText(inputProperty, fixedInputText),
                  fixer.remove(outputProperty),
                ].filter(isNotNullOrUndefined);
              },
            });
          }
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
