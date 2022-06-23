import type { TSESTree } from '@typescript-eslint/utils';

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
      recommended: false,
    },
    schema: [],
    messages: {
      noForwardRef: `Avoid using \`${FORWARD_REF}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`CallExpression[callee.type="Identifier"][callee.name="${FORWARD_REF}"]`](
        node: TSESTree.CallExpression,
      ) {
        context.report({
          node,
          messageId: 'noForwardRef',
        });
      },
    };
  },
});
