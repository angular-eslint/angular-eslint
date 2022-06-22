import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';
import type { TextAttribute } from '@angular/compiler/src/render3/r3_ast';
import type {
  BoundAttribute,
  BoundEvent,
} from '@angular/compiler/src/render3/r3_ast';

type QuotesType = 'double' | 'single';
export type Options = [{ readonly quotesType?: QuotesType }];
export type MessageIds = 'quotes';
export const RULE_NAME = 'quotes';
const DEFAULT_OPTIONS: Required<Options[0]> = { quotesType: 'double' };

const QUOTES_TYPE_TO_CHAR: Record<QuotesType, string> = {
  single: "'",
  double: '"',
};
const CHAR_TO_QUOTES_TYPE: Record<string, QuotesType> = (
  Object.keys(QUOTES_TYPE_TO_CHAR) as QuotesType[]
).reduce((ret, quotesType: QuotesType) => {
  ret[QUOTES_TYPE_TO_CHAR[quotesType]] = quotesType;
  return ret;
}, {} as Record<string, QuotesType>);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description:
        'Specify whether to use double quotes or single quotes in template attributes',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          quotesType: {
            type: 'string',
            enum: ['double', 'single'],
            default: DEFAULT_OPTIONS.quotesType,
          },
        },
      },
    ],
    messages: {
      quotes:
        'Expected {{expectedQuotesType}} quotes but {{actualQuotesType}} quotes are used',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, options) {
    const expectedQuotesType: QuotesType =
      options[0].quotesType ?? DEFAULT_OPTIONS.quotesType;
    const requestedQuotesChar = QUOTES_TYPE_TO_CHAR[expectedQuotesType];

    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      'TextAttribute, BoundAttribute, BoundEvent'(
        node: TextAttribute | BoundAttribute | BoundEvent,
      ) {
        const valueSpan =
          (node as TextAttribute).valueSpan ?? (node as BoundEvent).handlerSpan;
        if (!valueSpan) {
          return;
        }
        const startIndex: number = valueSpan.start.offset - 1;
        const endIndex: number = valueSpan.end.offset + 1;
        const quotesChar: string = sourceCode.text[startIndex];
        const actualQuotesType: QuotesType | undefined =
          CHAR_TO_QUOTES_TYPE[quotesChar];
        if (actualQuotesType && actualQuotesType != expectedQuotesType) {
          context.report({
            messageId: 'quotes',
            data: {
              actualQuotesType,
              expectedQuotesType,
            },
            loc: {
              start: sourceCode.getLocFromIndex(startIndex),
              end: sourceCode.getLocFromIndex(endIndex),
            },
            fix: (fixer) => {
              return [
                fixer.removeRange([startIndex, startIndex + 1]),
                fixer.insertTextAfterRange(
                  [startIndex, startIndex],
                  requestedQuotesChar,
                ),
                fixer.removeRange([endIndex - 1, endIndex]),
                fixer.insertTextAfterRange(
                  [endIndex, endIndex],
                  requestedQuotesChar,
                ),
              ];
            },
          });
        }
      },
    };
  },
});
