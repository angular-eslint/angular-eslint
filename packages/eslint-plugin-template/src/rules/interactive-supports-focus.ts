import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';
import {
  isInteractiveElement,
  isNonInteractiveRole,
} from '../utils/is-interactive-element';
import { isContentEditable } from '../utils/is-content-editable';
import { isDisabledElement } from '../utils/is-disabled-element';
import { isPresentationRole } from '../utils/is-presentation-role';

export type Options = [
  {
    readonly allowList?: readonly string[];
  },
];
export type MessageIds = 'interactiveSupportsFocus';
export const RULE_NAME = 'interactive-supports-focus';
const DEFAULT_ALLOW_LIST = ['form'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that elements with interactive handlers like `(click)` are focusable.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowList: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
        },
        type: 'object',
      },
    ],
    messages: {
      interactiveSupportsFocus:
        'Elements with interaction handlers must be focusable.',
    },
  },
  defaultOptions: [{ allowList: DEFAULT_ALLOW_LIST }],
  create(context, [{ allowList }]) {
    return {
      Element$1(node: TmplAstElement) {
        const elementType = node.name;
        if (!getDomElements().has(elementType)) {
          return;
        }

        const interactiveOutput = node.outputs.find(
          (output: { name: string }) =>
            output.name === 'click' ||
            output.name.startsWith('keyup') ||
            output.name.startsWith('keydown') ||
            output.name.startsWith('keypress'),
        );

        if (isElementInAllowList(elementType, allowList)) return;

        if (
          !interactiveOutput ||
          isDisabledElement(node) ||
          isHiddenFromScreenReader(node) ||
          isPresentationRole(node)
        ) {
          // Presentation is an intentional signal from the author
          // that this element is not meant to be perceivable.
          // For example, a click screen overlay to close a dialog.
          return;
        }

        const tabIndex = [...node.attributes, ...node.inputs].find(
          (attr) => attr.name === 'tabindex',
        );

        if (
          interactiveOutput &&
          !tabIndex &&
          !isInteractiveElement(node) &&
          !isNonInteractiveRole(node) &&
          !isContentEditable(node)
        ) {
          const parserServices = getTemplateParserServices(context);
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.sourceSpan,
          );
          const messageId: MessageIds = 'interactiveSupportsFocus';
          context.report({
            loc,
            messageId,
          });
        }
      },
    };
  },
});

function isElementInAllowList(
  elementType: string,
  allowList?: readonly string[],
): boolean | undefined {
  return (
    allowList && allowList.length > 0 && allowList.indexOf(elementType) > -1
  );
}
