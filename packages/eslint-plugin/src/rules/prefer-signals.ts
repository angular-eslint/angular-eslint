import { Selectors } from '@angular-eslint/utils';
import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    preferReadonlySignalProperties: boolean;
    preferInputSignals: boolean;
    preferQuerySignals: boolean;
    useTypeChecking: boolean;
    additionalSignalCreationFunctions: string[];
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  preferReadonlySignalProperties: true,
  preferInputSignals: true,
  preferQuerySignals: true,
  useTypeChecking: false,
  additionalSignalCreationFunctions: [],
};

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

export type MessageIds =
  | 'preferInputSignals'
  | 'preferQuerySignals'
  | 'preferReadonlySignalProperties'
  | 'suggestAddReadonlyModifier';
export const RULE_NAME = 'prefer-signals';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use readonly signals instead of `@Input()`, `@ViewChild()` and other legacy decorators',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          preferReadonlySignalProperties: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.preferReadonlySignalProperties,
          },
          preferInputSignals: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.preferInputSignals,
          },
          preferQuerySignals: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.preferQuerySignals,
          },
          useTypeChecking: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.useTypeChecking,
          },
          additionalSignalCreationFunctions: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_OPTIONS.additionalSignalCreationFunctions,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferInputSignals:
        'Use `InputSignal`s (e.g. via `input()`) for Component input properties rather than the legacy `@Input()` decorator',
      preferQuerySignals:
        'Use the `{{function}}` function instead of the `{{decorator}}` decorator',
      preferReadonlySignalProperties:
        'Properties declared using signals should be marked as `readonly` since they should not be reassigned',
      suggestAddReadonlyModifier: 'Add `readonly` modifier',
    },
  },
  defaultOptions: [{ ...DEFAULT_OPTIONS }],
  create(
    context,
    [
      {
        preferReadonlySignalProperties = DEFAULT_OPTIONS.preferReadonlySignalProperties,
        preferInputSignals = DEFAULT_OPTIONS.preferInputSignals,
        preferQuerySignals = DEFAULT_OPTIONS.preferQuerySignals,
        additionalSignalCreationFunctions = DEFAULT_OPTIONS.additionalSignalCreationFunctions,
        useTypeChecking = DEFAULT_OPTIONS.useTypeChecking,
      },
    ],
  ) {
    let services: ParserServicesWithTypeInformation | undefined;
    const listener: ESLintUtils.RuleListener = {};

    if (preferReadonlySignalProperties) {
      listener[`PropertyDefinition:not([readonly=true])`] = (
        node: TSESTree.PropertyDefinition,
      ) => {
        let shouldBeReadonly = false;

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
              shouldBeReadonly = true;
            }
          }
        } else {
          // There is no type annotation, so try to
          // use the value assigned to the property
          // to determine whether it would be a signal.
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
                additionalSignalCreationFunctions.includes(callee.name))
            ) {
              shouldBeReadonly = true;
            }
          }

          if (!shouldBeReadonly && useTypeChecking && node.value) {
            services ??= ESLintUtils.getParserServices(context);
            const name = services
              .getTypeAtLocation(node.value)
              .getSymbol()?.name;

            shouldBeReadonly =
              name !== undefined && KNOWN_SIGNAL_TYPES.has(name);
          }
        }

        if (shouldBeReadonly) {
          context.report({
            node: node.key,
            messageId: 'preferReadonlySignalProperties',
            suggest: [
              {
                messageId: 'suggestAddReadonlyModifier',
                fix: (fixer) => fixer.insertTextBefore(node.key, 'readonly '),
              },
            ],
          });
        }
      };
    }

    if (preferInputSignals) {
      listener[Selectors.INPUT_DECORATOR] = (node) => {
        context.report({
          node,
          messageId: 'preferInputSignals',
        });
      };
    }

    if (preferQuerySignals) {
      listener[
        'Decorator[expression.callee.name=/^(ContentChild|ContentChildren|ViewChild|ViewChildren)$/]'
      ] = (node: TSESTree.Decorator) => {
        if (
          node.expression.type === AST_NODE_TYPES.CallExpression &&
          node.expression.callee.type === AST_NODE_TYPES.Identifier
        ) {
          const decoratorName = node.expression.callee.name;
          context.report({
            node,
            messageId: 'preferQuerySignals',
            data: {
              function:
                decoratorName.slice(0, 1).toLowerCase() +
                decoratorName.slice(1),
              decorator: decoratorName,
            },
          });
        }
      };
    }

    return listener;
  },
});
