import type { Call } from '@angular-eslint/bundled-angular-compiler';
import {
  ImplicitReceiver,
  PropertyRead,
  ThisReceiver,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAny' | 'suggestRemoveAny';
export const RULE_NAME = 'no-any';
const ANY_TYPE_CAST_FUNCTION_NAME = '$any';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The use of "${ANY_TYPE_CAST_FUNCTION_NAME}" nullifies the compile-time benefits of Angular's type system`,
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noAny: `Avoid using "${ANY_TYPE_CAST_FUNCTION_NAME}" in templates`,
      suggestRemoveAny: `Remove ${ANY_TYPE_CAST_FUNCTION_NAME}`,
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      [`Call[receiver.name="${ANY_TYPE_CAST_FUNCTION_NAME}"]`]({
        receiver,
        sourceSpan: { end, start },
      }: Call) {
        if (!(receiver instanceof PropertyRead)) {
          return;
        }
        if (
          !(
            // this.$any() is also valid usage of the native Angular $any()
            (
              receiver.receiver instanceof ThisReceiver ||
              receiver.receiver instanceof ImplicitReceiver
            )
          )
        ) {
          return;
        }
        const nameSpan = receiver.nameSpan;
        context.report({
          messageId: 'noAny',
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          suggest: [
            {
              messageId: 'suggestRemoveAny',
              fix: (fixer) => [
                fixer.removeRange([nameSpan.start, nameSpan.end + 1]),
                fixer.removeRange([end - 1, end]),
              ],
            },
          ],
        });
      },
    };
  },
});
