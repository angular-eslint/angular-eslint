import type { TmplAstElement } from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'mouseOverEventHasFocusEvent'
  | 'mouseOutEventHasBlurEvent';
export const RULE_NAME = 'mouse-events-have-key-events';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the Mouse Events mouseover and mouseout are accompanied with Key Events focus and blur.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      mouseOverEventHasFocusEvent:
        'mouseover must be accompanied by focus event for accessibility.',
      mouseOutEventHasBlurEvent:
        'mouseout must be accompanied by blur event for accessibility',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: TmplAstElement) {
        let hasMouseOver = false,
          hasMouseOut = false,
          hasFocus = false,
          hasBlur = false;

        // This is much simpler and faster to have a single `for` loop,
        // instead of having 4 `node.outputs.some` expressions (per each event)
        // which will have `O(4n)` complexity.
        for (const output of node.outputs) {
          hasMouseOver = output.name === 'mouseover';
          hasMouseOut = output.name === 'mouseout';
          hasFocus = output.name === 'focus';
          hasBlur = output.name === 'blur';
        }

        if (!hasMouseOver && !hasMouseOut) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        if (hasMouseOver && !hasFocus) {
          context.report({
            loc,
            messageId: 'mouseOverEventHasFocusEvent',
          });
        }

        if (hasMouseOut && !hasBlur) {
          context.report({
            loc,
            messageId: 'mouseOutEventHasBlurEvent',
          });
        }
      },
    };
  },
});
