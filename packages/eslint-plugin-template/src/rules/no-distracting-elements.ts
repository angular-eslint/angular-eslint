import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noDistractingElements';
export const RULE_NAME = 'no-distracting-elements';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces that no distracting elements are used',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noDistractingElements:
        'Do not use <{{element}}> elements as they can create visual accessibility issues and are deprecated',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element$1[name=/^(blink|marquee)$/]'({
        name: element,
        sourceSpan,
      }: TmplAstElement) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'noDistractingElements',
          data: { element },
          fix: (fixer) =>
            fixer.removeRange([sourceSpan.start.offset, sourceSpan.end.offset]),
        });
      },
    };
  },
});
