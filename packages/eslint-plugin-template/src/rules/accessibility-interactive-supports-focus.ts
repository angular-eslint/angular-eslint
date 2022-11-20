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

type Options = [];
export type MessageIds = 'interactiveSupportsFocus';
export const RULE_NAME = 'accessibility-interactive-supports-focus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that elements with interactive handlers like `(click)` are focusable.',
      recommended: false,
    },
    schema: [],
    messages: {
      interactiveSupportsFocus:
        'Elements with interaction handlers must be focusable.',
    },
  },
  defaultOptions: [],
  create(context) {
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
