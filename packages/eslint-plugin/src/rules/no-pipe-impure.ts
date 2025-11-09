import { RuleFixes, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noPipeImpure' | 'suggestRemovePipeImpure';
export const RULE_NAME = 'no-pipe-impure';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the declaration of impure pipes',
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
    const sourceCode = context.sourceCode;

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

export const RULE_DOCS_EXTENSION = {
  rationale: `Impure pipes are executed on every change detection cycle, regardless of whether their inputs have changed. In a typical Angular application, change detection runs very frequently (on every user interaction, timer, HTTP request, etc.). An impure pipe in a template with a list of 100 items might execute 100 times per change detection cycle, potentially thousands of times per second, causing severe performance problems. Pure pipes (the default) only re-execute when their input references change, making them much more efficient. Impure pipes should be avoided unless you have a specific need and understand the performance implications. In most cases, you can achieve the same result with a pure pipe and proper change detection strategy.`,
};
