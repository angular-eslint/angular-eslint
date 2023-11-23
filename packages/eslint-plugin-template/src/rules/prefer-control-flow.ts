import { createESLintRule } from '../utils/create-eslint-rule';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';

export const MESSAGE_ID = 'preferControlFlow';
export const RULE_NAME = 'prefer-control-flow';

export default createESLintRule<[], typeof MESSAGE_ID>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the built-in control flow is used.',
    },
    schema: [],
    messages: {
      [MESSAGE_ID]: 'Use built-in control flow instead of directive {{name}}.',
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
          messageId: MESSAGE_ID,
          loc,
          data: { name },
        });
      },
    };
  },
});
