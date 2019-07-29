import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noForwardRef';
export const RULE_NAME = 'no-forward-ref';

export const FORWARD_REF = 'forwardRef';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of \`${FORWARD_REF}\` references for DI`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noForwardRef: `Avoid using \`${FORWARD_REF}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    /**
     * TODO: Investigate ways of making this faster using known
     * usage of forwardRef()
     */
    return {
      'CallExpression[callee.type="Identifier"]'(
        node: TSESTree.CallExpression,
      ) {
        const callee = node.callee as TSESTree.Identifier;
        if (callee.name !== FORWARD_REF) {
          return;
        }
        context.report({
          node,
          messageId: 'noForwardRef',
        });
      },
    };
  },
});
