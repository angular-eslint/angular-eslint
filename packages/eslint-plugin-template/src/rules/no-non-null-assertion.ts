import { NonNullAssert } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noNonNullAssertion';
export const RULE_NAME = 'no-non-null-assertion';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the non-null assertion operator (!) in templates',
    },
    schema: [],
    messages: {
      noNonNullAssertion:
        'Avoid using the non-null assertion operator (!) in templates. This bypasses type safety and can lead to runtime errors.',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const { sourceCode } = context;

    return {
      NonNullAssert(node: NonNullAssert) {
        const { start, end } = node.sourceSpan;

        context.report({
          messageId: 'noNonNullAssertion',
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Equivalent of @typescript-eslint/no-non-null-assertion rule for Angular templates. TypeScript's `!` non-null assertion operator asserts to the type system that an expression is non-nullable, as in not `null` or `undefined`. Using assertions to tell the type system new information is often a sign that code is not fully type-safe. It's generally better to structure program logic so that TypeScript understands when values may be nullable.",
};
