import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that the `autofocus` attribute is not used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAutofocus:
        'The `autofocus` attribute should not be used, as it reduces usability and accessibility for users',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const elementNamePattern = toPattern([...getDomElements()]);

    return {
      [`Element[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)[name="autofocus"]`]({
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'noAutofocus',
          fix: (fixer) =>
            fixer.removeRange([
              sourceSpan.start.offset - 1,
              sourceSpan.end.offset,
            ]),
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The autofocus attribute automatically moves focus to an element when the page loads, which can be disorienting and problematic for accessibility. For screen reader users, autofocus disrupts their normal navigation flow and can cause them to miss important page content. For users with motor disabilities, unexpected focus changes can be confusing. For users with cognitive disabilities, the auto-focused element might grab attention before they've had a chance to understand the page structure. Additionally, autofocus can interfere with browser features like scroll restoration. If focus management is needed, implement it through Angular lifecycle hooks with proper context awareness rather than using the autofocus attribute.",
};
