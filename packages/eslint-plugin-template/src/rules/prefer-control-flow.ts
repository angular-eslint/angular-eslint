import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'preferControlFlow';
export const RULE_NAME = 'prefer-control-flow';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the built-in control flow is used.',
    },
    schema: [],
    messages: {
      preferControlFlow:
        'Use built-in control flow instead of directive {{name}}.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name=/^(ngForOf|ngIf|ngSwitch)$/]'({
        sourceSpan,
        name,
      }: TmplAstBoundAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
        context.report({
          messageId: 'preferControlFlow',
          loc,
          data: { name },
        });
      },
    };
  },
});
