import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

type TmplAstElementWithAncestor = TmplAstElement & {
  parent?: TmplAstElementWithAncestor;
};

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
      [`Element[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)[name="autofocus"]`](
        node: TmplAstElementWithAncestor,
      ) {
        // Allow autofocus on dialog elements and their descendants
        // per MDN accessibility guidelines:
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
        if (isInDialogElement(node)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'noAutofocus',
          fix: (fixer) =>
            fixer.removeRange([
              node.sourceSpan.start.offset - 1,
              node.sourceSpan.end.offset,
            ]),
        });
      },
    };
  },
});

function isInDialogElement(attribute: TmplAstElementWithAncestor): boolean {
  let current = attribute.parent;

  while (current) {
    if (current.name?.toLowerCase() === 'dialog') {
      return true;
    }
    current = current.parent;
  }

  return false;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The autofocus attribute automatically moves focus to an element when the page loads, which can be disorienting and problematic for accessibility. For screen reader users, autofocus disrupts their normal navigation flow and can cause them to miss important page content. For users with motor disabilities, unexpected focus changes can be confusing. For users with cognitive disabilities, the auto-focused element might grab attention before they've had a chance to understand the page structure. Additionally, autofocus can interfere with browser features like scroll restoration. If focus management is needed, implement it through Angular lifecycle hooks with proper context awareness rather than using the autofocus attribute.\n\nHowever, there is an important exception: Using autofocus on elements within <dialog> elements (or on the dialog itself) is actually recommended for accessibility. According to MDN, the autofocus attribute should be added to the element the user is expected to interact with immediately upon opening a modal dialog. If no other element involves more immediate interaction, it is recommended to add autofocus to the close button inside the dialog, or the dialog itself. This rule automatically allows autofocus when used within dialog elements.",
};
