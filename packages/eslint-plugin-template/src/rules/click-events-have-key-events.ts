import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';
import { isInteractiveElement } from '../utils/is-interactive-element';
import { isPresentationRole } from '../utils/is-presentation-role';

export type Options = [
  {
    readonly ignoreWithDirectives?: string[];
  },
];
export type MessageIds = 'clickEventsHaveKeyEvents';
export const RULE_NAME = 'click-events-have-key-events';
const DEFAULT_OPTIONS: Options[number] = {
  ignoreWithDirectives: [],
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreWithDirectives: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: DEFAULT_OPTIONS.ignoreWithDirectives as
              | string[]
              | undefined,
          },
        },
        additionalProperties: false,
      }
    ],
    messages: {
      clickEventsHaveKeyEvents:
        'click must be accompanied by either keyup, keydown or keypress event for accessibility.',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ ignoreWithDirectives }]) {
    return {
      Element(node: TmplAstElement) {
        if (!getDomElements().has(node.name)) {
          return;
        }

        if (
          isIgnored(ignoreWithDirectives, node) ||
          isPresentationRole(node) ||
          isHiddenFromScreenReader(node) ||
          isInteractiveElement(node)
        ) {
          return;
        }

        let hasClick = false,
          hasKeyEvent = false;

        for (const output of node.outputs) {
          hasClick = hasClick || output.name === 'click';
          hasKeyEvent =
            hasKeyEvent ||
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

function isIgnored(
  ignoreWithDirectives: string[] | undefined,
  { inputs, attributes }: TmplAstElement,
) {
  if (ignoreWithDirectives && ignoreWithDirectives.length > 0) {
    for (const input of inputs) {
      if (ignoreWithDirectives.includes(input.name)) {
        return true;
      }
    }
    for (const attribute of attributes) {
      if (ignoreWithDirectives.includes(attribute.name)) {
        return true;
      }
    }
  }

  return false;
}
