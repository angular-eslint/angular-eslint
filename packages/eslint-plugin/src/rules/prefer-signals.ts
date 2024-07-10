import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { Selectors } from '@angular-eslint/utils';

type Options = [
  {
    typesToReplace: string[];
    preferReadonly: boolean;
    preferInputSignal: boolean;
    useTypeChecking: boolean;
    signalCreationFunctions: string[];
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  typesToReplace: ['BehaviorSubject'],
  preferReadonly: true,
  preferInputSignal: true,
  useTypeChecking: false,
  signalCreationFunctions: [],
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
  | 'preferInputSignal'
  | 'preferReadonly'
  | 'preferSignal'
  | 'suggestAddReadonlyModifier';
export const RULE_NAME = 'prefer-signals';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer to use signals instead of `BehaviorSubject`, `@Input()` and other decorators',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          typesToReplace: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_OPTIONS.typesToReplace,
          },
          preferReadonly: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.preferReadonly,
          },
          preferInputSignal: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.preferInputSignal,
          },
          useTypeChecking: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.useTypeChecking,
          },
          signalCreationFunctions: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_OPTIONS.signalCreationFunctions,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferSignal: 'Prefer to use `Signal` instead of {{type}}',
      preferInputSignal:
        'Prefer to use `InputSignal` type instead of `@Input()` decorator',
      preferReadonly:
        'Prefer to declare `Signal` properties as `readonly` since they are not supposed to be reassigned',
      suggestAddReadonlyModifier: 'Add `readonly` modifier',
    },
  },
  defaultOptions: [{ ...DEFAULT_OPTIONS }],
  create(
    context,
    [
      {
        typesToReplace = DEFAULT_OPTIONS.typesToReplace,
        preferReadonly = DEFAULT_OPTIONS.preferReadonly,
        preferInputSignal = DEFAULT_OPTIONS.preferInputSignal,
        signalCreationFunctions = DEFAULT_OPTIONS.signalCreationFunctions,
        useTypeChecking = DEFAULT_OPTIONS.useTypeChecking,
      },
    ],
  ) {
    let services: ParserServicesWithTypeInformation | undefined;
    let listener: ESLintUtils.RuleListener;

    listener = {};

    if (typesToReplace.length > 0) {
      listener.NewExpression = (node) => {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          typesToReplace.includes(node.callee.name)
        ) {
          context.report({
            node: node.callee,
            messageId: 'preferSignal',
            data: { type: node.callee.name },
          });
        }
      };
    }

    if (preferReadonly) {
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
                signalCreationFunctions.includes(callee.name))
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
            messageId: 'preferReadonly',
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

    if (preferInputSignal) {
      listener[Selectors.INPUT_DECORATOR] = (node) => {
        context.report({
          node,
          messageId: 'preferInputSignal',
        });
      };
    }

    return listener;
  },
});
