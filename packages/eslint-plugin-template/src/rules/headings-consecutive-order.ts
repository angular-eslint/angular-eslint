import {
  TmplAstElement,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstNode } from '@angular/compiler';

export const RULE_NAME = 'headings-consecutive-order';
export const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
export type MessageId = 'headingsOrder';

export default createESLintRule<[], MessageId>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      // link: https://www.w3.org/WAI/tutorials/page-structure/headings/
      description:
        '[Accessibility] Ensures that headings have consecutive order from largest to lowest h1 -> h6',
      recommended: false,
    },
    schema: [],
    messages: {
      headingsOrder: 'Headings number sequence must not be skipped',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const ngTemplateChildrenTagsToSkip: string[] = [];
    let headingLastIndex: number;

    return {
      [`Element$1[name=/^(h1|h2|h3|h4|h5|h6)$/], Template[tagName="ng-template"]`](
        element: TmplAstElement | TmplAstTemplate,
      ) {
        if (element instanceof TmplAstTemplate && element.children) {
          // "ng-template"
          element.children.forEach((child: TmplAstNode) => {
            if (
              child instanceof TmplAstElement &&
              HEADING_TAGS.includes(child.name)
            ) {
              ngTemplateChildrenTagsToSkip.push(child.name);
            }
          });
        }

        if (element instanceof TmplAstElement) {
          // headings
          if (
            ngTemplateChildrenTagsToSkip.length > 0 &&
            element.name === ngTemplateChildrenTagsToSkip[0]
          ) {
            ngTemplateChildrenTagsToSkip.shift();
            return;
          }

          const headingCurrentIndex = +element.name.slice(1);

          if (
            headingLastIndex &&
            headingCurrentIndex - headingLastIndex !== 1 &&
            headingCurrentIndex > headingLastIndex
          ) {
            const loc = parserServices.convertNodeSourceSpanToLoc(
              element.sourceSpan,
            );

            context.report({
              loc,
              messageId: 'headingsOrder',
            });
          }
          headingLastIndex = headingCurrentIndex;
        }
      },
    };
  },
});
