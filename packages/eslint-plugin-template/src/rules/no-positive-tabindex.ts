import type {
  ParseSourceSpan,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds = 'noPositiveTabindex' | 'suggestNonNegativeTabindex';
export const RULE_NAME = 'no-positive-tabindex';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the `tabindex` attribute is not positive',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noPositiveTabindex: 'The `tabindex` attribute should not be positive',
      suggestNonNegativeTabindex: 'Use `tabindex="{{tabindex}}"`',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const domElements = [...getDomElements()];
    const uppercaseDomElements = domElements.map((element) =>
      element.toUpperCase(),
    );
    const elementNamePattern = toPattern([
      ...domElements,
      ...uppercaseDomElements,
    ]);

    return {
      [`Element[name=${elementNamePattern}] > BoundAttribute[name="tabindex"][value.ast.value>0], TextAttribute[name="tabindex"][value>0]`]({
        valueSpan,
      }: (TmplAstBoundAttribute | TmplAstTextAttribute) & {
        valueSpan: ParseSourceSpan;
      }) {
        const loc = parserServices.convertNodeSourceSpanToLoc(valueSpan);

        context.report({
          loc,
          messageId: 'noPositiveTabindex',
          suggest: ['-1', '0'].map((tabindex) => ({
            messageId: 'suggestNonNegativeTabindex',
            fix: (fixer) =>
              fixer.replaceTextRange(
                [valueSpan.start.offset, valueSpan.end.offset],
                tabindex,
              ),
            data: { tabindex },
          })),
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Positive values for tabindex attribute should be avoided because they mess up with the order of focus.',
};
