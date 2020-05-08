import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noNegatedAsync' | 'noLooseEquality';
export const RULE_NAME = 'no-negated-async';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that strict equality is used when evaluating negations on async pipe output`,
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
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
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();

    return parserServices.defineTemplateBodyVisitor({
      ['BindingPipe[name=async]'](node: any) {
        if (node.parent.type === 'PrefixNot') {
          const additionalStartOffset =
            node.parent.parent.type === 'Interpolation' ? -1 : -0;
          const additionalEndOffset =
            node.parent.parent.type === 'Interpolation' ? -2 : 0;

          const start = sourceCode.getLocFromIndex(
            node.parent.sourceSpan.start + additionalStartOffset,
          );
          const end = sourceCode.getLocFromIndex(
            node.parent.sourceSpan.end + additionalEndOffset,
          );

          context.report({
            messageId: 'noNegatedAsync',
            loc: {
              start,
              end,
            },
          });
          return;
        }

        if (node.parent.type === 'Binary' && node.parent.operation === '==') {
          const additionalStartOffset =
            node.parent.parent.type === 'Interpolation' ? -2 : -1;
          const additionalEndOffset =
            node.parent.parent.type === 'Interpolation' ? -2 : 0;
          const start = sourceCode.getLocFromIndex(
            node.parent.sourceSpan.start + additionalStartOffset,
          );
          const end = sourceCode.getLocFromIndex(
            node.parent.sourceSpan.end + additionalEndOffset,
          );

          context.report({
            messageId: 'noLooseEquality',
            loc: {
              start,
              end,
            },
          });
          return;
        }
      },
    });
  },
});
