import type {
  BindingPipe,
  PrefixNot,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'noNegatedAsync'
  | 'suggestFalseComparison'
  | 'suggestNullComparison'
  | 'suggestUndefinedComparison';
export const RULE_NAME = 'no-negated-async';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that async pipe results are not negated',
      recommended: 'error',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noNegatedAsync:
        'Async pipe results should not be negated. Use `(observable | async) === false`, `(observable | async) === null`, or `(observable | async) === undefined` to check its value instead',
      suggestFalseComparison: 'Compare with `false`',
      suggestNullComparison: 'Compare with `null`',
      suggestUndefinedComparison: 'Compare with `undefined`',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      ':not(PrefixNot) > PrefixNot > BindingPipe[name="async"]'({
        parent: {
          sourceSpan: { end, start },
        },
      }: BindingPipe & {
        parent: PrefixNot;
      }) {
        context.report({
          messageId: 'noNegatedAsync',
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          suggest: getSuggestionsSchema().map(
            ({ messageId, textToInsert }) => ({
              messageId,
              fix: (fixer) => [
                fixer.removeRange([start, start + 1]),
                fixer.insertTextAfterRange([end, end], textToInsert),
              ],
            }),
          ),
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `Angular's async pipes emit null initially, prior to the observable emitting any values, or the promise resolving. This can cause negations, like *ngIf="!(myConditional | async)" to thrash the layout and cause expensive side-effects like firing off XHR requests for a component which should not be shown.`,
};

function getSuggestionsSchema() {
  return [
    { messageId: 'suggestFalseComparison', textToInsert: ' === false' },
    { messageId: 'suggestNullComparison', textToInsert: ' === null' },
    {
      messageId: 'suggestUndefinedComparison',
      textToInsert: ' === undefined',
    },
  ] as const;
}
