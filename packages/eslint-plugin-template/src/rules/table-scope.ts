import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

type Options = [];
export type MessageIds = 'tableScope';
export const RULE_NAME = 'table-scope';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that the `scope` attribute is only used on the `<th>` element',
      recommended: false,
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
    const domElementsPattern = toPattern(
      [...getDomElements()].filter((domElement) => domElement !== 'th'),
    );

    return {
      [`Element$1[name=${domElementsPattern}] > :matches(BoundAttribute, TextAttribute)[name='scope']`]({
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
