import type {
  TmplAstElement,
  TmplAstText,
} from '@angular-eslint/bundled-angular-compiler';
import {
  getTemplateParserServices,
  NATIVE_ELEMENTS,
} from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export const MESSAGE_ID = 'selfClosingTags';
export const RULE_NAME = 'self-closing-tags';

export default createESLintRule<[], typeof MESSAGE_ID>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that self-closing tags are used for elements with a closing tag but no content.',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      [MESSAGE_ID]:
        'Use self-closing tags for elements with a closing tag but no content.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element$1({
        children,
        name,
        startSourceSpan,
        endSourceSpan,
      }: TmplAstElement) {
        const isNative = NATIVE_ELEMENTS.includes(name);
        const noContent =
          !children.length ||
          children.every((node) => {
            const text = (node as TmplAstText).value;

            // If the node has no value, or only whitespace,
            // we can consider it empty.
            return (
              typeof text === 'string' && text.replace(/\n/g, '').trim() === ''
            );
          });
        const noCloseTag =
          !endSourceSpan ||
          (startSourceSpan.start.offset === endSourceSpan.start.offset &&
            startSourceSpan.end.offset === endSourceSpan.end.offset);

        if (isNative || !noContent || noCloseTag) {
          return;
        }

        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(endSourceSpan),
          messageId: MESSAGE_ID,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [startSourceSpan.end.offset - 1, endSourceSpan.end.offset],
              ' />',
            ),
        });
      },
    };
  },
});
