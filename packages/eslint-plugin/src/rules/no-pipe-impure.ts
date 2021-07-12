import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import { getNodeToCommaRemoveFix } from '../utils/utils';

type Options = [];
export type MessageIds = 'noPipeImpure' | 'suggestRemovePipeImpure';
export const RULE_NAME = 'no-pipe-impure';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the declaration of impure pipes',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
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
      [`${PIPE_CLASS_DECORATOR} ObjectExpression > Property:matches([key.name='pure'], [key.value='pure']):matches([value.value=false], [value.operator='!'][value.argument.value=true])[computed=false]`](
        node: TSESTree.Property & { parent: TSESTree.ObjectExpression },
      ) {
        context.report({
          node,
          messageId: 'noPipeImpure',
          suggest: [
            {
              messageId: 'suggestRemovePipeImpure',
              fix: (fixer) => getNodeToCommaRemoveFix(sourceCode, node, fixer),
            },
          ],
        });
      },
    };
  },
});
