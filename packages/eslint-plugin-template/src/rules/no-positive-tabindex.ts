import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noPositiveTabindex';
export const RULE_NAME = 'no-positive-tabindex';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the tabindex attribute is not positive',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noPositiveTabindex: 'tabindex attribute cannot be positive',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name="tabindex"][value.ast.value>0], TextAttribute[name="tabindex"][value>0]'({
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'noPositiveTabindex',
        });
      },
    };
  },
});
