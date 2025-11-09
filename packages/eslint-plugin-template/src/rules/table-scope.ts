import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds = 'tableScope';
export const RULE_NAME = 'table-scope';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that the `scope` attribute is only used on the `<th>` element',
    },
    fixable: 'code',
    schema: [],
    messages: {
      tableScope: 'The `scope` attribute should only be on the `<th>` element',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const domElements = [...getDomElements()].filter(
      (domElement) => domElement !== 'th',
    );
    const uppercaseDomElements = domElements.map((element) =>
      element.toUpperCase(),
    );
    const domElementsPattern = toPattern([
      ...domElements,
      ...uppercaseDomElements,
    ]);

    return {
      [`Element[name=${domElementsPattern}] > :matches(BoundAttribute, TextAttribute)[name='scope']`]({
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'tableScope',
          fix: (fixer) =>
            fixer.removeRange([
              sourceSpan.start.offset - 1,
              sourceSpan.end.offset,
            ]),
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'The scope attribute on table headers (<th>) tells screen readers whether a header applies to a column or row, enabling more efficient table navigation. When screen reader users navigate table cells, the screen reader announces the associated headers. Without proper scope attributes, users must manually explore the table structure to understand what each cell represents. Use scope="col" for column headers and scope="row" for row headers. For simple tables, screen readers can often infer the scope, but explicit scope attributes ensure reliable accessibility across all screen readers.',
};
