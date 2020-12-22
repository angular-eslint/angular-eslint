import {
  ASTWithSource,
  Binary,
  Lexer,
  Parser,
  TmplAstBoundAttribute,
} from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [{ maxComplexity: number }];

export type MessageIds = 'conditionalСomplexity';
export const RULE_NAME = 'conditional-complexity';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The condition complexity shouldn't exceed a rational limit in a template.`,
      category: 'Best Practices',
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
      conditionalСomplexity:
        'The condition complexity "{{totalComplexity}}" exceeds the defined limit "{{maxComplexity}}"',
    },
  },
  defaultOptions: [{ maxComplexity: 5 }],
  create(context, [{ maxComplexity }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name="ngIf"]'({
        sourceSpan,
        value,
      }: TmplAstBoundAttribute) {
        const totalComplexity = getTotalComplexity(value as ASTWithSource);

        if (totalComplexity <= maxComplexity) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'conditionalСomplexity',
          data: { maxComplexity, totalComplexity },
        });
      },
    };
  },
});

let parser: Parser | null = null;
// Instantiate the `Parser` class lazily only when this rule is applied.
function getParser(): Parser {
  return parser || (parser = new Parser(new Lexer()));
}

function getTotalComplexity({ source }: ASTWithSource): number {
  const expression = source?.replace(/\s/g, '') ?? '';
  const parser = getParser();
  const astWithSource = parser.parseAction(expression, null, 0);
  const conditions: Binary[] = [];
  let totalComplexity = 0;
  let condition = astWithSource.ast as Binary;

  if (condition.operation) {
    totalComplexity++;
    conditions.push(condition);
  }

  while (conditions.length > 0) {
    const condition = conditions.pop()!;

    if (!condition.operation) {
      continue;
    }

    if (condition.left instanceof Binary) {
      totalComplexity++;
      conditions.push(condition.left);
    }

    if (condition.right instanceof Binary) {
      totalComplexity++;
      conditions.push(condition.right);
    }
  }

  return totalComplexity;
}
