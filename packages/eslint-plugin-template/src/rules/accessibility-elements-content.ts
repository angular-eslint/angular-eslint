import type { TmplAstElement } from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityElementsContent';
export const RULE_NAME = 'accessibility-elements-content';
const innerContentInputs: ReadonlySet<string> = new Set([
  'innerHtml',
  'innerHTML',
  'innerText',
]);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the heading, anchor and button elements have content in it.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityElementsContent: '<{{element}}/> should have content.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name=/^(a|button|h1|h2|h3|h4|h5|h6)$/][children.length=0]'({
        inputs,
        name: element,
        sourceSpan,
      }: TmplAstElement) {
        const hasInnerContent = inputs.some(({ name }) =>
          innerContentInputs.has(name),
        );

        if (hasInnerContent) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityElementsContent',
          data: { element },
        });
      },
    };
  },
});
