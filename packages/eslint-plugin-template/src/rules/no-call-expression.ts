import type { MethodCall, SafeMethodCall } from '@angular/compiler';
import { TmplAstBoundEvent } from '@angular/compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';

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
      'MethodCall[name!="$any"], SafeMethodCall'(
        node: MethodCall | SafeMethodCall,
      ) {
        const isChildOfBoundEvent = !!getNearestNodeFrom(node, isBoundEvent);

        if (isChildOfBoundEvent) return;

        const {
          sourceSpan: { start, end },
        } = node;
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

function isBoundEvent(node: unknown): node is TmplAstBoundEvent {
  return node instanceof TmplAstBoundEvent;
}
