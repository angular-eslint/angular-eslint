import type { BindingPipe, PrefixNot } from '@angular/compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noNegatedAsync';
export const RULE_NAME = 'no-negated-async';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that async pipe results are not negated',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noNegatedAsync:
        'Async pipe results should not be negated. Use (observable | async) === (false || null || undefined) to check its value instead',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      'PrefixNot > BindingPipe[name="async"]'({
        parent: { sourceSpan },
      }: BindingPipe & {
        parent: PrefixNot;
      }) {
        context.report({
          messageId: 'noNegatedAsync',
          loc: {
            start: sourceCode.getLocFromIndex(sourceSpan.start),
            end: sourceCode.getLocFromIndex(sourceSpan.end),
          },
        });
      },
    };
  },
});
