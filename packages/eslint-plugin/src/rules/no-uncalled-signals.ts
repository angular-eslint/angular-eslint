import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { KNOWN_SIGNAL_TYPES } from '../utils/signals';

export type Options = [];
export type MessageIds = 'noUncalledSignals' | 'suggestCallSignal';
export const RULE_NAME = 'no-uncalled-signals';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Warns user about unintentionally doing logic on the signal, rather than the signal's value",
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noUncalledSignals:
        'Doing logic operations on signals will give unexpected results, you probably want to invoke the signal to get its value',
      suggestCallSignal: 'Call this signal to get its value.',
    },
  },
  defaultOptions: [],
  create(context) {
    const services: ParserServicesWithTypeInformation =
      ESLintUtils.getParserServices(context);

    return {
      '*.test[type=Identifier],*.test Identifier,[type=LogicalExpression] Identifier'(
        node: TSESTree.Identifier,
      ) {
        if (node.parent.type === AST_NODE_TYPES.CallExpression) {
          return;
        }

        const type = services.getTypeAtLocation(node);
        const identifierType = type.getSymbol()?.name;

        if (identifierType && KNOWN_SIGNAL_TYPES.has(identifierType)) {
          context.report({
            node,
            messageId: 'noUncalledSignals',
            suggest: [
              {
                messageId: 'suggestCallSignal',
                fix: (fixer) => fixer.replaceText(node, `${node.name}()`),
              },
            ],
          });
        }
      },
    };
  },
});
