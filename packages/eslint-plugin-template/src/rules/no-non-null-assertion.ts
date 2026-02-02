import {
  NonNullAssert,
  KeyedRead,
  PropertyRead,
  SafePropertyRead,
  BindingPipe,
  AST,
  ParenthesizedExpression,
} from '@angular-eslint/bundled-angular-compiler';
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

    const reportNonNullAssertion = (node: NonNullAssert): void => {
      const { start, end } = node.sourceSpan;

      context.report({
        messageId: 'noNonNullAssertion',
        loc: {
          start: sourceCode.getLocFromIndex(start),
          end: sourceCode.getLocFromIndex(end),
        },
      });
    };

    /**
     * Recursively finds and reports NonNullAssert nodes that may be nested
     * inside expressions where they aren't automatically visited.
     */
    const findAndReportNonNullAssertions = (node: AST): void => {
      if (node instanceof NonNullAssert) {
        reportNonNullAssertion(node);
      } else if (
        node instanceof KeyedRead ||
        node instanceof PropertyRead ||
        node instanceof SafePropertyRead
      ) {
        findAndReportNonNullAssertions(node.receiver);
      } else if (node instanceof BindingPipe) {
        findAndReportNonNullAssertions(node.exp);
        for (const arg of node.args) {
          findAndReportNonNullAssertions(arg);
        }
      } else if (node instanceof ParenthesizedExpression) {
        findAndReportNonNullAssertions(node.expression);
      }
    };

    return {
      NonNullAssert(node: NonNullAssert) {
        reportNonNullAssertion(node);
      },
      KeyedRead({ receiver }: KeyedRead) {
        findAndReportNonNullAssertions(receiver);
      },
      'PropertyRead, SafePropertyRead'({ receiver }: PropertyRead) {
        // Skip reporting if receiver is directly a NonNullAssert (will be caught by NonNullAssert visitor)
        // but still traverse deeper in case there are nested NonNullAssert
        if (receiver instanceof NonNullAssert) {
          findAndReportNonNullAssertions(receiver.expression);
        } else {
          findAndReportNonNullAssertions(receiver);
        }
      },
      BindingPipe({ args }: BindingPipe) {
        for (const arg of args) {
          findAndReportNonNullAssertions(arg);
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Equivalent of @typescript-eslint/no-non-null-assertion rule for Angular templates. TypeScript's `!` non-null assertion operator asserts to the type system that an expression is non-nullable, as in not `null` or `undefined`. Using assertions to tell the type system new information is often a sign that code is not fully type-safe. It's generally better to structure program logic so that TypeScript understands when values may be nullable.",
};
