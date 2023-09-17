import type {
  TmplAstElement,
  TmplAstText,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';

export const MESSAGE_ID = 'preferSelfClosingTags';
export const RULE_NAME = 'prefer-self-closing-tags';

export default createESLintRule<[], typeof MESSAGE_ID>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
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
        // Ignore native elements.
        if (getDomElements().has(name)) {
          return;
        }

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

        if (!noContent || noCloseTag) {
          return;
        }

        // HTML tags always have more than two characters
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const openingTagLastChar = startSourceSpan.toString().at(-2)!;
        const hasOwnWhitespace = openingTagLastChar.trim() === '';
        const closingTagPrefix = hasOwnWhitespace ? '' : ' ';

        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(endSourceSpan),
          messageId: MESSAGE_ID,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [startSourceSpan.end.offset - 1, endSourceSpan.end.offset],
              closingTagPrefix + '/>',
            ),
        });
      },
    };
  },
});
