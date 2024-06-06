import type {
  TmplAstContent,
  TmplAstElement,
  TmplAstTemplate,
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

    // angular 18 doesnt support self closing tags in index.html
    if (context.physicalFilename.endsWith('src/index.html')) {
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
      const closingTagPrefix = getClosingTagPrefix(openingTagLastChar);

      context.report({
        loc: parserServices.convertNodeSourceSpanToLoc(endSourceSpan),
        messageId: MESSAGE_ID,
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
        // content nodes can only contain whitespaces
        const content =
          sourceSpan
            .toString()
            .match(/>(\s*)</m)
            ?.at(1) ?? '';
        const openingTagLastChar =
          // This is more than the minimum length of a ng-content element
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sourceSpan
            .toString()
            .at(-2 - ngContentCloseTag.length - content.length)!;
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
          messageId: MESSAGE_ID,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                sourceSpan.end.offset -
                  ngContentCloseTag.length -
                  content.length -
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
