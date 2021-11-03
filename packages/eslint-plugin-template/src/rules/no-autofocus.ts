import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the `autofocus` attribute is not used',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAutofocus:
        'The `autofocus` attribute should not be used, as it reduces usability and accessibility for users',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const elementNamePattern = toPattern([...getDomElements()]);

    return {
      [`Element$1[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)[name="autofocus"]`]({
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'noAutofocus',
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
