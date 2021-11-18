import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';
import { isInteractiveElement } from '../utils/is-interactive-element';
import { isPresentationRole } from '../utils/is-presentation-role';

type Options = [];
export type MessageIds = 'clickEventsHaveKeyEvents';
export const RULE_NAME = 'click-events-have-key-events';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress.',
      recommended: false,
    },
    schema: [],
    messages: {
      clickEventsHaveKeyEvents:
        'click must be accompanied by either keyup, keydown or keypress event for accessibility.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Element$1(node: TmplAstElement) {
        if (!getDomElements().has(node.name)) {
          return;
        }

        if (
          isPresentationRole(node) ||
          isHiddenFromScreenReader(node) ||
          isInteractiveElement(node)
        ) {
          return;
        }

        let hasClick = false,
          hasKeyEvent = false;

        for (const output of node.outputs) {
          hasClick = output.name === 'click';
          hasKeyEvent =
            output.name.startsWith('keyup') ||
            output.name.startsWith('keydown') ||
            output.name.startsWith('keypress');
        }

        if (!hasClick || hasKeyEvent) {
          return;
        }

        const parserServices = getTemplateParserServices(context);
        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'clickEventsHaveKeyEvents',
        });
      },
    };
  },
});
