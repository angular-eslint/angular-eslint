import { Binary, PrefixNot } from '@angular/compiler';
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
      'PrefixNot > BindingPipe[name=async]'({ parent }: { parent: PrefixNot }) {
        context.report({
          messageId: 'noNegatedAsync',
          loc: {
            start: sourceCode.getLocFromIndex(parent.sourceSpan.start),
            end: sourceCode.getLocFromIndex(parent.sourceSpan.end),
          },
        });
      },
      'Binary[operation="=="] > BindingPipe[name=async]'({
        parent,
      }: {
        parent: Binary;
      }) {
        /**
         * ISSUE REPORTED HERE: https://github.com/angular/angular/issues/40721
         *
         * In version 11.1.2 of @angular/compiler the leading "(" is missing from the "source"
         * within the parsed `ASTWithSource` node. In order to make location data line up we
         * therefore adjust it manually for now.
         */
        const startOffset = -1;

        context.report({
          messageId: 'noLooseEquality',
          loc: {
            start: sourceCode.getLocFromIndex(
              parent.sourceSpan.start + startOffset,
            ),
            end: sourceCode.getLocFromIndex(parent.sourceSpan.end),
          },
        });
      },
    };
  },
});
