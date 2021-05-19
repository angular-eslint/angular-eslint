import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that autofocus attribute is not used',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAutofocus:
        'autofocus attribute should not be used, as it reduces usability and accessibility for users',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'TextAttribute[name="autofocus"], BoundAttribute[name="autofocus"]'(
        node: TmplAstTextAttribute | TmplAstBoundAttribute,
      ) {
        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'noAutofocus',
          fix: (fixer) =>
            fixer.removeRange([
              node.sourceSpan.start.col,
              node.sourceSpan.end.col + 1,
            ]),
        });
      },
    };
  },
});
