import type { TSESTree } from '@typescript-eslint/utils';

import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noForwardRef';
export const RULE_NAME = 'no-forward-ref';

export const FORWARD_REF = 'forwardRef';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of \`${FORWARD_REF}\` references for DI`,
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The forwardRef() function is a workaround for circular dependencies in Angular's dependency injection system, but it obscures the dependency graph and can make code harder to understand and maintain. When forwardRef() is used, it's often a sign of poor architecture, such as circular dependencies between components or services that could be resolved through better abstraction. Modern Angular and TypeScript have reduced the need for forwardRef() in most cases. Instead, consider restructuring your code to eliminate circular dependencies, using interfaces for dependency injection, or moving shared logic into a separate service.",
};
