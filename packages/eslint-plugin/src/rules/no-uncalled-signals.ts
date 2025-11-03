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

const CONDITIONAL_SELECTOR = [
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.IfStatement,
  AST_NODE_TYPES.SwitchCase,
  AST_NODE_TYPES.WhileStatement,
].join(',');

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

    function checkForUncalledSignal(node: TSESTree.Node): void {
      // Unwrap negated expressions so that
      // we look at what was being negated.
      if (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === '!'
      ) {
        node = node.argument;
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
              fix: (fixer) => fixer.insertTextAfter(node, '()'),
            },
          ],
        });
      }
    }

    return {
      [CONDITIONAL_SELECTOR](
        node:
          | TSESTree.ConditionalExpression
          | TSESTree.DoWhileStatement
          | TSESTree.ForStatement
          | TSESTree.IfStatement
          | TSESTree.SwitchCase
          | TSESTree.WhileStatement,
      ) {
        if (node.test) {
          checkForUncalledSignal(node.test);
        }
      },
      LogicalExpression(node: TSESTree.LogicalExpression) {
        checkForUncalledSignal(node.left);
        checkForUncalledSignal(node.right);
      },
      BinaryExpression(node: TSESTree.BinaryExpression) {
        checkForUncalledSignal(node.left);
        checkForUncalledSignal(node.right);
      },
    };
  },
});
