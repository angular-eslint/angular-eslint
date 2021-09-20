import type { AST } from '@angular/compiler';
import { AbsoluteSourceSpan } from '@angular/compiler';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getLocFromAbsoluteSourceSpan } from '../utils/get-loc-from-absolute-source-span';

type Options = [
  string | { readonly message?: string; readonly selector: string },
];
export type MessageIds = 'noRestrictedSyntax';
export const RULE_NAME = 'no-restricted-syntax';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows specified syntax.',
      category: 'Stylistic Issues',
      recommended: false,
    },
    schema: {
      type: 'array',
      items: {
        oneOf: [
          {
            minLength: 1,
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              message: { type: 'string' },
              selector: { type: 'string' },
            },
            required: ['selector'],
            additionalProperties: false,
          },
        ],
      },
      uniqueItems: true,
      minItems: 1,
    },
    messages: {
      noRestrictedSyntax: '{{message}}',
    },
  },
  defaultOptions: [''],
  create(context, options) {
    const sourceCode = context.getSourceCode();
    const parserServices = getTemplateParserServices(context);

    function visitor(message: string) {
      return ({ sourceSpan }: AST) => {
        const loc =
          sourceSpan instanceof AbsoluteSourceSpan
            ? getLocFromAbsoluteSourceSpan(sourceCode, sourceSpan)
            : parserServices.convertNodeSourceSpanToLoc(sourceSpan);
        context.report({
          loc,
          messageId: 'noRestrictedSyntax',
          data: {
            message,
          },
        });
      };
    }

    return options.reduce<Record<string, TSESLint.RuleFunction>>(
      (selectors, selectorOrOption) => {
        const { message, selector } = getNormalizedOptions(selectorOrOption);
        return {
          ...selectors,
          // If the `selector` is already computed (it can happens in case of passing `string` + object format), we just ignore it.
          ...(!(selector in selectors) && { [selector]: visitor(message) }),
        };
      },
      {},
    );
  },
});

function getNormalizedOptions(selectorOrOption: Options[number]) {
  const isStringFormat = typeof selectorOrOption === 'string';
  const selector = isStringFormat
    ? selectorOrOption
    : selectorOrOption.selector;
  const message =
    !isStringFormat && selectorOrOption.message
      ? selectorOrOption.message
      : `Using \`${selector}\` is not allowed.`;
  return { message, selector } as const;
}
