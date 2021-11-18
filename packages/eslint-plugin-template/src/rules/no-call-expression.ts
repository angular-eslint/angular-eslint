import type { Call } from '@angular-eslint/bundled-angular-compiler';
import { TmplAstBoundEvent } from '@angular-eslint/bundled-angular-compiler';
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
      'Call[receiver.name!="$any"]'(node: Call) {
        const isChildOfBoundEvent = Boolean(
          getNearestNodeFrom(node, isBoundEvent),
        );

        if (isChildOfBoundEvent) return;

        const {
          sourceSpan: { start, end },
        } = node;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noCallExpression',
        });
      },
    };
  },
});

function isBoundEvent(node: unknown): node is TmplAstBoundEvent {
  return node instanceof TmplAstBoundEvent;
}
