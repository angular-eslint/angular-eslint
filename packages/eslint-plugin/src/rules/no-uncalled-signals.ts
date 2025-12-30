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

const FUNCTION_MEMBER_EXPRESSION_SELECTOR = `MemberExpression[property.type=Identifier]:matches(${[
  'arguments',
  'caller',
  'length',
  'name',
  'toString',
].map((member) => `[property.name=${member}]`)})`;

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
      [FUNCTION_MEMBER_EXPRESSION_SELECTOR](node: TSESTree.MemberExpression) {
        checkForUncalledSignal(node.object);
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Angular signals are functions that must be called to retrieve their value. A common mistake, especially for developers new to signals, is to use the signal itself in conditional or logical expressions without calling it first. For example, 'if (mySignal)' checks if the signal function exists (which is always true), not whether the signal's value is truthy. You need 'if (mySignal())' to check the value. This bug is easy to make because signals look like regular properties but behave like functions. The mistake leads to logic errors where conditions always evaluate incorrectly. This rule catches these mistakes by detecting when signals are used in conditionals, comparisons, or logical operations without being called.",
};
