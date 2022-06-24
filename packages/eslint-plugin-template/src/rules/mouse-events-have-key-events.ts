import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint } from '@typescript-eslint/utils';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

type Options = [];
export type MessageIds = 'mouseEventsHaveKeyEvents';
export const RULE_NAME = 'mouse-events-have-key-events';
const STYLE_GUIDE_LINK = 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard';

const enum KeyEvents {
  Blur = 'blur',
  Focus = 'focus',
}

const enum MouseEvents {
  MouseOut = 'mouseout',
  MouseOver = 'mouseover',
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that the mouse events \`${MouseEvents.MouseOut}\` and \`${MouseEvents.MouseOver}\` are accompanied by \`${KeyEvents.Focus}\` and \`${KeyEvents.Blur}\` events respectively. Coding for the keyboard is important for users with physical disabilities who cannot use a mouse, AT compatibility, and screenreader users. See more at ${STYLE_GUIDE_LINK}`,
      recommended: false,
    },
    schema: [],
    messages: {
      mouseEventsHaveKeyEvents: `\`{{mouseEvent}}\` must be accompanied by \`{{keyEvent}}\` for accessibility (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const domElementsPattern = toPattern([...getDomElements()]);
    const eventPairs = [
      [KeyEvents.Blur, MouseEvents.MouseOut],
      [KeyEvents.Focus, MouseEvents.MouseOver],
    ] as const;

    return eventPairs.reduce<Record<string, TSESLint.RuleFunction>>(
      (accumulator, [keyEvent, mouseEvent]) => ({
        ...accumulator,
        [`Element$1[name=${domElementsPattern}]:has(BoundEvent[name='${mouseEvent}']):not(:has(BoundEvent[name='${keyEvent}']))`]({
          sourceSpan,
        }: TmplAstElement) {
          const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

          context.report({
            loc,
            messageId: 'mouseEventsHaveKeyEvents',
            data: { keyEvent, mouseEvent },
          });
        },
      }),
      {},
    );
  },
});
