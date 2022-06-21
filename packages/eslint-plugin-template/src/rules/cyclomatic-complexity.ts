import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [{ maxComplexity: number }];
export type MessageIds = 'cyclomaticComplexity';
export const RULE_NAME = 'cyclomatic-complexity';

const DEFAULT_MAX_COMPLEXITY = 5;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code`,
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxComplexity: {
            type: 'number',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      cyclomaticComplexity:
        'The cyclomatic complexity {{totalComplexity}} exceeds the defined limit {{maxComplexity}}',
    },
  },
  defaultOptions: [{ maxComplexity: DEFAULT_MAX_COMPLEXITY }],
  create(context, [{ maxComplexity }]) {
    let totalComplexity = 0;
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name=/^(ngForOf|ngIf|ngSwitchCase)$/], TextAttribute[name="ngSwitchDefault"]'({
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        totalComplexity += 1;

        if (totalComplexity <= maxComplexity) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          messageId: 'cyclomaticComplexity',
          loc,
          data: { maxComplexity, totalComplexity },
        });
      },
    };
  },
});
