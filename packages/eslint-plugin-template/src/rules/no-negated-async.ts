import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noNegatedAsync' | 'noLooseEquality';
export const RULE_NAME = 'no-negated-async';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that strict equality is used when evaluating negations on async pipe output',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noNegatedAsync:
        'Async pipes should not be negated. Use (observable | async) === (false | null | undefined) to check its value instead',
      noLooseEquality:
        'Async pipes must use strict equality `===` when comparing with `false`',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      'PrefixNot > BindingPipe[name=async]'({
        parent: {
          parent: { type },
          sourceSpan: { end, start },
        },
      }: any) {
        const additionalOffset = isInterpolation(type) ? -1 : 0;
        const loc = {
          start: sourceCode.getLocFromIndex(start + additionalOffset),
          end: sourceCode.getLocFromIndex(end + additionalOffset),
        } as const;

        context.report({
          messageId: 'noNegatedAsync',
          loc,
        });
      },
      'Binary[operation="=="] > BindingPipe[name=async]'({
        parent: {
          parent: { type },
          sourceSpan: { end, start },
        },
      }: any) {
        const additionalStartOffset = isInterpolation(type) ? -2 : -1;
        const additionalEndOffset = isInterpolation(type) ? -1 : 0;
        const loc = {
          start: sourceCode.getLocFromIndex(start + additionalStartOffset),
          end: sourceCode.getLocFromIndex(end + additionalEndOffset),
        } as const;

        context.report({
          messageId: 'noLooseEquality',
          loc,
        });
      },
    };
  },
});

function isInterpolation(value: string): value is 'Interpolation' {
  return value === 'Interpolation';
}
