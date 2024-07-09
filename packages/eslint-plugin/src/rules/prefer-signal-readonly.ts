import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    signalCreationFunctions: string[];
  },
];
export type MessageIds = 'preferSignalReadonly' | 'suggestAddReadonlyModifier';
export const RULE_NAME = 'prefer-signal-readonly';
const KNOWN_SIGNAL_TYPES: ReadonlySet<string> = new Set([
  'InputSignal',
  'ModelSignal',
  'Signal',
  'WritableSignal',
]);
const KNOWN_SIGNAL_CREATION_FUNCTIONS: ReadonlySet<string> = new Set([
  'computed',
  'contentChild',
  'contentChildren',
  'input',
  'model',
  'signal',
  'toSignal',
  'viewChild',
  'viewChildren',
]);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer to declare `Signal` properties as `readonly` since they are not supposed to be reassigned',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          signalCreationFunctions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferSignalReadonly:
        'Prefer to declare `Signal` properties as `readonly` since they are not supposed to be reassigned',
      suggestAddReadonlyModifier: 'Add `readonly` modifier',
    },
  },
  defaultOptions: [
    {
      signalCreationFunctions: [],
    },
  ],
  create(context, [{ signalCreationFunctions = [] }]) {
    return {
      [`PropertyDefinition:not([readonly=true])`](
        node: TSESTree.PropertyDefinition,
      ) {
        if (node.typeAnnotation) {
          // Use the type annotation to determine
          // whether the property is a signal.
          if (
            node.typeAnnotation.typeAnnotation.type ===
            AST_NODE_TYPES.TSTypeReference
          ) {
            const type = node.typeAnnotation.typeAnnotation;
            if (
              type.typeArguments &&
              type.typeName.type === AST_NODE_TYPES.Identifier &&
              KNOWN_SIGNAL_TYPES.has(type.typeName.name)
            ) {
              report();
            }
          }
        } else {
          // There is no type annotation, so use
          // the value assigned to the property to
          // determine whether it would be a signal.
          if (node.value?.type === AST_NODE_TYPES.CallExpression) {
            let callee: TSESTree.Node = node.value.callee;
            // Some signal-creating functions have a `.required`
            // member. For example, `input.required()`.
            if (callee.type === AST_NODE_TYPES.MemberExpression) {
              if (
                callee.property.type === AST_NODE_TYPES.Identifier &&
                callee.property.name !== 'required'
              ) {
                return;
              }
              callee = callee.object;
            }
            if (
              callee.type === AST_NODE_TYPES.Identifier &&
              (KNOWN_SIGNAL_CREATION_FUNCTIONS.has(callee.name) ||
                signalCreationFunctions.includes(callee.name))
            ) {
              report();
            }
          }
        }

        function report() {
          context.report({
            node: node.key,
            messageId: 'preferSignalReadonly',
            suggest: [
              {
                messageId: 'suggestAddReadonlyModifier',
                fix: (fixer) => fixer.insertTextBefore(node.key, 'readonly '),
              },
            ],
          });
        }
      },
    };
  },
});
