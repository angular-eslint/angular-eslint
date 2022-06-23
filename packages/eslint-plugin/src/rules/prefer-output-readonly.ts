import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'preferOutputReadonly' | 'suggestAddReadonlyModifier';
export const RULE_NAME = 'prefer-output-readonly';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer to declare `@Output` as `readonly` since they are not supposed to be reassigned',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferOutputReadonly:
        'Prefer to declare `@Output` as `readonly` since they are not supposed to be reassigned',
      suggestAddReadonlyModifier: 'Add `readonly` modifier',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`PropertyDefinition:not([readonly]) > ${Selectors.OUTPUT_DECORATOR}`]({
        parent: { key },
      }: TSESTree.Decorator & { parent: TSESTree.PropertyDefinition }) {
        context.report({
          node: key,
          messageId: 'preferOutputReadonly',
          suggest: [
            {
              messageId: 'suggestAddReadonlyModifier',
              fix: (fixer) => fixer.insertTextBefore(key, 'readonly '),
            },
          ],
        });
      },
    };
  },
});
