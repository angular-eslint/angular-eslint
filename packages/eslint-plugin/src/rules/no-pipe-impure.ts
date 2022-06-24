import { RuleFixes, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noPipeImpure' | 'suggestRemovePipeImpure';
export const RULE_NAME = 'no-pipe-impure';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the declaration of impure pipes',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noPipeImpure:
        'Impure pipes should be avoided because they are invoked on each change-detection cycle',
      suggestRemovePipeImpure: 'Remove `pure` property',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [`${Selectors.PIPE_CLASS_DECORATOR} ${Selectors.metadataProperty(
        'pure',
      )}:matches([value.value=false], [value.operator='!'][value.argument.value=true])`](
        node: TSESTree.Property,
      ) {
        context.report({
          node,
          messageId: 'noPipeImpure',
          suggest: [
            {
              messageId: 'suggestRemovePipeImpure',
              fix: (fixer) =>
                RuleFixes.getNodeToCommaRemoveFix(sourceCode, node, fixer),
            },
          ],
        });
      },
    };
  },
});
