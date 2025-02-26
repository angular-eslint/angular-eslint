import type {
  TmplAstContent,
  TmplAstElement,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
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

    // angular 18 doesn't support self closing tags in index.html
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
      const { startSourceSpan, endSourceSpan } = node;

      if (
        !endSourceSpan ||
        (startSourceSpan.start.offset === endSourceSpan.start.offset &&
          startSourceSpan.end.offset === endSourceSpan.end.offset)
      ) {
        // No close tag.
        return;
      }

      // If the element only contains whitespace, we can consider it
      // empty. We cannot use the children to reliably determine whether
      // the element only contains whitespace because the template
      // parser will HTML-decoded the text. For example, if the raw
      // content contains `&nbsp;`, that is decoded to a space, but
      // we need to treat that as content that should be kept.
      //
      // Likewise, if the node only contains comments, those comments
      // will not appear in the syntax tree, which results in the
      // content appearing empty.
      //
      // So instead of using the syntax tree, we'll look at the
      // source code and get the text that appears between the
      // start element and the end element.
      if (
        context.sourceCode.text
          .slice(startSourceSpan.end.offset, endSourceSpan.start.offset)
          .trim() !== ''
      ) {
        // The element has content.
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
      if (sourceSpan.toString().includes(ngContentCloseTag)) {
        const whiteSpaceContent = sourceSpan
          .toString()
          .match(/<ng-content[^>]*>(\s*)<\/ng-content>/m)
          ?.at(1);
        const hasContent = typeof whiteSpaceContent === 'undefined';
        if (hasContent) {
          return;
        }
        const openingTagLastChar =
          // This is more than the minimum length of a ng-content element
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sourceSpan
            .toString()
            .at(-2 - ngContentCloseTag.length - whiteSpaceContent.length)!;
        const closingTagPrefix = getClosingTagPrefix(openingTagLastChar);

        context.report({
          // content nodes don't have information about startSourceSpan and endSourceSpan,
          // so we need to calculate it by our own
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
                sourceSpan.end.offset -
                  ngContentCloseTag.length -
                  whiteSpaceContent.length -
                  1,
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

function getClosingTagPrefix(openingTagLastChar: string): string {
  const hasOwnWhitespace = openingTagLastChar.trim() === '';
  return hasOwnWhitespace ? '' : ' ';
}
