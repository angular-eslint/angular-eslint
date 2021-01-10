import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'preferOutputReadonly';
export const RULE_NAME = 'prefer-output-readonly';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      preferOutputReadonly:
        'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassProperty[readonly=undefined] > Decorator[expression.callee.name="Output"]'({
        parent,
      }: TSESTree.Decorator) {
        context.report({
          node: (parent as TSESTree.ClassProperty).key,
          messageId: 'preferOutputReadonly',
        });
      },
    };
  },
});
