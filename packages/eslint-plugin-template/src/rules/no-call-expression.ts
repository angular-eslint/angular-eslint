import { MethodCall } from '@angular/compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noCallExpression';
export const RULE_NAME = 'no-call-expression';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows calling expressions in templates, except for output handlers',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noCallExpression: 'Avoid calling expressions in templates',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      ':not(BoundEvent) > * > :matches(MethodCall[name!="$any"], SafeMethodCall)'({
        sourceSpan: { end, start },
      }: MethodCall) {
        context.report({
          messageId: 'noCallExpression',
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
        });
      },
    };
  },
});
