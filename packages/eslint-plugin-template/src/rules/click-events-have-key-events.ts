import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';
import { isInherentlyInteractiveElement } from '../utils/is-interactive-element';
import { isPresentationRole } from '../utils/is-presentation-role';
import { getAttributeValue } from '../utils/get-attribute-value';
import { ARIARole } from 'aria-query';

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
      },
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
        if (!getDomElements().has(node.name.toLowerCase())) {
          return;
        }

        if (
          isIgnored(ignoreWithDirectives, node) ||
          isPresentationRole(node) ||
          isHiddenFromScreenReader(node) ||
          isInherentlyInteractiveElement(node)
        ) {
          return;
        }

        // The final case that should be ignored is element which is not inherently interactive, but which has an interactive role.
        // TODO: extend utils with this check (and make it include all interactive roles)
        const role = getAttributeValue(node, 'role') as ARIARole;
        if (role === 'button') {
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Elements with click handlers must also be operable via keyboard for users who cannot use a mouse. This includes users with motor disabilities, users of assistive technologies, and keyboard-only users. While native interactive elements like buttons and links are keyboard-accessible by default (activated by Enter or Space keys), non-interactive elements with click handlers (like divs or spans) are not. For such elements, you must add keyboard event handlers (keyup, keydown, or keypress) that perform the same action as the click handler. Alternatively, use a semantic button element which handles this automatically. This is a WCAG Level A requirement for keyboard accessibility.',
};
