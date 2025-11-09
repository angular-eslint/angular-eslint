import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noDistractingElements';
export const RULE_NAME = 'no-distracting-elements';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Enforces that no distracting elements are used',
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
      'Element[name=/^(blink|marquee)$/i]'({
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Elements like <marquee> and <blink> create distracting motion that can cause problems for users with attention disorders, vestibular disorders, or seizure disorders. Moving text is harder to read for everyone, including users with dyslexia or cognitive disabilities. These elements are also deprecated in HTML5 and not well-supported across browsers. WCAG guidelines require that moving, blinking, or scrolling content can be paused, stopped, or hidden by users. Instead of these elements, use modern CSS animations with appropriate controls, or simply use static content that doesn't distract from the main page content.",
};
