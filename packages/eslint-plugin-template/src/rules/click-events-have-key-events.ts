import type { TmplAstElement } from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';
import { isInteractiveElement } from '../utils/is-interactive-element';
import { isPresentationRole } from '../utils/is-presentation-role';
import { toPattern } from '../utils/to-pattern';

type Options = [];
export type MessageIds = 'clickEventsHaveKeyEvents';
export const RULE_NAME = 'click-events-have-key-events';
const STYLE_GUIDE_LINK = 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that the \`click\` event is accompanied by at least one of the following: \`keydown\`, \`keypress\` or \`keyup\` events. Coding for the keyboard is important for users with physical disabilities who cannot use a mouse, AT compatibility, and screenreader users. This does not apply for interactive or hidden elements. See more at ${STYLE_GUIDE_LINK}`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      clickEventsHaveKeyEvents: `The \`click\` event should be accompanied by at least one of the following: \`keydown\`, \`keypress\` or \`keyup\` events (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const domElementsPattern = toPattern([...getDomElements()]);

    return {
      [`Element[name=${domElementsPattern}]:has(BoundEvent[name='click']):not(:has(BoundEvent[name=/^(keyup|keydown|keypress)(\\..+)?$/]))`](
        node: TmplAstElement,
      ) {
        if (
          isPresentationRole(node) ||
          isHiddenFromScreenReader(node) ||
          isInteractiveElement(node)
        ) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'clickEventsHaveKeyEvents',
        });
      },
    };
  },
});
