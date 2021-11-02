import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';

type Options = [];
export type MessageIds = 'accessibilityElementsContent';
export const RULE_NAME = 'accessibility-elements-content';
const safelistAttributes: ReadonlySet<string> = new Set([
  'aria-label',
  'innerHtml',
  'innerHTML',
  'innerText',
  'outerHTML',
  'title',
]);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the heading, anchor and button elements have content in it',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityElementsContent: '<{{element}}> should have content',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element$1[name=/^(a|button|h1|h2|h3|h4|h5|h6)$/][children.length=0]'(
        node: TmplAstElement,
      ) {
        if (isHiddenFromScreenReader(node)) return;

        const { attributes, inputs, name: element, sourceSpan } = node;
        const hasAttributeSafelisted = [...attributes, ...inputs]
          .map(({ name }) => name)
          .some((inputName) => safelistAttributes.has(inputName));

        if (hasAttributeSafelisted) return;

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
