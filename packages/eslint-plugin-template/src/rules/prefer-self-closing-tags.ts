import type {
  TmplAstContent,
  TmplAstElement,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
import { TmplAstText } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';

export type Options = [];
export type MessageIds = 'preferSelfClosingTags';
export const RULE_NAME = 'prefer-self-closing-tags';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description:
        'Ensures that self-closing tags are used for elements with a closing tag but no content.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferSelfClosingTags:
        'Use self-closing tags for elements with a closing tag but no content.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    // angular 18 doesnt support self closing tags in index.html
    if (/src[\\/]index\.html$/.test(context.physicalFilename)) {
      // If it is, return an empty object to skip this rule
      return {};
    }
    return {
      'Element$1, Template, Content'(
        node: TmplAstElement | TmplAstTemplate | TmplAstContent,
      ) {
        if (isContentNode(node)) {
          processContentNode(node);
        } else {
          // Ignore native elements.
          if ('name' in node && getDomElements().has(node.name)) {
            return;
          }
          processElementOrTemplateNode(node);
        }
      },
    };

    function processElementOrTemplateNode(
      node: TmplAstElement | TmplAstTemplate,
    ) {
      const { children, startSourceSpan, endSourceSpan } = node;

      const noContent =
        !children.length ||
        children.every((node) => {
          // If the node is only whitespace, we can consider it empty.
          // We need to look at the text from the source code, rather
          // than the `TmplAstText.value` property. The `value` property
          // contains the HTML-decoded value, so if the raw text contains
          // `&nbsp;`, that is decoded to a space, but we don't want to
          // treat that as empty text.
          return (
            node instanceof TmplAstText &&
            context.sourceCode.text
              .slice(node.sourceSpan.start.offset, node.sourceSpan.end.offset)
              .trim() === ''
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
      const closingTagPrefix = getClosingTagPrefix(openingTagLastChar);

      context.report({
        loc: parserServices.convertNodeSourceSpanToLoc(endSourceSpan),
        messageId: 'preferSelfClosingTags',
        fix: (fixer) =>
          fixer.replaceTextRange(
            [startSourceSpan.end.offset - 1, endSourceSpan.end.offset],
            closingTagPrefix + '/>',
          ),
      });
    }

    function processContentNode(node: TmplAstContent) {
      const { sourceSpan } = node;
      const ngContentCloseTag = '</ng-content>';
      const source = sourceSpan.toString();
      if (source.endsWith(ngContentCloseTag)) {
        // Content nodes don't have information about `startSourceSpan`
        // and `endSourceSpan`, so we need to calculate where the inner
        // HTML is ourselves. We know that the source ends with
        // "</ng-content>", so we know where inner HTML ends.
        // We just need to find where the inner HTML starts.
        const startOfInnerHTML = findStartOfNgContentInnerHTML(source);
        // If the start of the inner HTML is also where the close tag starts,
        // then there is no inner HTML and we can avoid slicing the string.
        if (startOfInnerHTML < source.length - ngContentCloseTag.length) {
          if (
            source.slice(startOfInnerHTML, -ngContentCloseTag.length).trim()
              .length > 0
          ) {
            return;
          }
        }
        // The source will always have at least "<ng-content"
        // before the inner HTML, so two characters before
        // the inner HTML will always be a valid index.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const openingTagLastChar = source.at(startOfInnerHTML - 2)!;
        const closingTagPrefix = getClosingTagPrefix(openingTagLastChar);

        context.report({
          loc: {
            start: {
              line: sourceSpan.end.line + 1,
              column: sourceSpan.end.col - ngContentCloseTag.length,
            },
            end: {
              line: sourceSpan.end.line + 1,
              column: sourceSpan.end.col,
            },
          },
          messageId: 'preferSelfClosingTags',
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                sourceSpan.start.offset + startOfInnerHTML - 1,
                sourceSpan.end.offset,
              ],
              closingTagPrefix + '/>',
            ),
        });
      }
    }
  },
});

function isContentNode(
  node: TmplAstElement | TmplAstTemplate | TmplAstContent,
): node is TmplAstContent {
  return 'name' in node && node.name === 'ng-content';
}

function findStartOfNgContentInnerHTML(html: string): number {
  let quote: string | undefined;

  // The HTML will always start with at least "<ng-content",
  // so we can skip over that part and start at index 11.
  for (let i = 11; i < html.length; i++) {
    const char = html.at(i);
    if (quote !== undefined) {
      if (quote === char) {
        quote = undefined;
      }
    } else {
      switch (char) {
        case '>':
          return i + 1;
        case '"':
        case "'":
          quote = char;
          break;
      }
    }
  }

  return html.length;
}

function getClosingTagPrefix(openingTagLastChar: string): string {
  const hasOwnWhitespace = openingTagLastChar.trim() === '';
  return hasOwnWhitespace ? '' : ' ';
}
