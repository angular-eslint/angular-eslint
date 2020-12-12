import { dom } from 'aria-query';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { isPresentationRole } from '../utils/is-presentational-role';
import { isInteractiveElement } from '../utils/is-interactive-element';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';

type Options = [];
export type MessageIds = 'clickEventsHaveKeyEvents';
export const RULE_NAME = 'click-events-have-key-events';

const domElements = new Set<string>(dom.keys());

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress.',
      category: 'Best Practices',
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
      Element(node: any) {
        if (!domElements.has(node.name)) {
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
