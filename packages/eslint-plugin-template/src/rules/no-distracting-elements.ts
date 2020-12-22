import { TmplAstElement } from '@angular/compiler';
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
      category: 'Best Practices',
      recommended: false,
    },
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
      'Element[name=/^(blink|marquee)$/]'({
        name: element,
        sourceSpan,
      }: TmplAstElement) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'noDistractingElements',
          data: { element },
        });
      },
    };
  },
});
