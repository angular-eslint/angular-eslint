import {
  Node,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
  TmplAstIfBlock,
  TmplAstForLoopBlock,
  TmplAstSwitchBlockCase,
  ParseSourceSpan,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ maxComplexity: number }];
export type MessageIds = 'cyclomaticComplexity';
export const RULE_NAME = 'cyclomatic-complexity';

const DEFAULT_MAX_COMPLEXITY = 5;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code`,
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

    function increment(node: { sourceSpan: ParseSourceSpan }): void {
      totalComplexity += 1;

      if (totalComplexity <= maxComplexity) return;

      const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

      context.report({
        messageId: 'cyclomaticComplexity',
        loc,
        data: { maxComplexity, totalComplexity },
      });
    }

    return {
      '*': (node: Node) => {
        if (
          node instanceof TmplAstBoundAttribute &&
          /^(ngForOf|ngIf|ngSwitchCase)$/.test(node.name)
        ) {
          increment(node);
        } else if (
          node instanceof TmplAstTextAttribute &&
          node.name === 'ngSwitchDefault'
        ) {
          increment(node);
        } else if (
          node instanceof TmplAstIfBlock ||
          node instanceof TmplAstForLoopBlock ||
          node instanceof TmplAstSwitchBlockCase
        ) {
          increment(node);
        }
      },
    };
  },
});
