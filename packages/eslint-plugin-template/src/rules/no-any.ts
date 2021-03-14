import type { MethodCall } from '@angular/compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAny';
export const RULE_NAME = 'no-any';
const ANY_TYPE_CAST_FUNCTION_NAME = '$any';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The use of "${ANY_TYPE_CAST_FUNCTION_NAME}" nullifies the compile-time benefits of the Angular's type system.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noAny: `Avoid using "${ANY_TYPE_CAST_FUNCTION_NAME}" in templates`,
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      [`MethodCall[name="${ANY_TYPE_CAST_FUNCTION_NAME}"][receiver.expression=undefined][receiver.name=undefined]`]({
        sourceSpan: { end, start },
      }: MethodCall) {
        context.report({
          messageId: 'noAny',
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
        });
      },
    };
  },
});
