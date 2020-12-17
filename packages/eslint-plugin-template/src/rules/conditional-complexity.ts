import { Parser, Lexer, Binary, ASTWithSource } from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [
  {
    maxComplexity: number;
  },
];

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
    fixable: 'code',
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
      conditionalСomplexity: `The condition complexity (cost '{{totalComplexity}}') exceeded the defined limit (cost '{{maxComplexity}}'). The conditional expression should be moved into the component.`,
    },
  },
  defaultOptions: [
    {
      maxComplexity: 5,
    },
  ],
  create(context, [options]) {
    const parserServices = getTemplateParserServices(context);

    return parserServices.defineTemplateBodyVisitor({
      BoundAttribute(node: any) {
        if (node.name !== 'ngIf') {
          return;
        }

        const { maxComplexity } = options;
        const totalComplexity = getTotalComplexity(node.value);

        if (totalComplexity <= maxComplexity) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'conditionalСomplexity',
          data: { totalComplexity, maxComplexity },
        });
      },
    });
  },
});

let parser: Parser | null = null;
// Instantiate the `Parser` class lazily only when this rule is applied.
function getParser(): Parser {
  return parser || (parser = new Parser(new Lexer()));
}

function getTotalComplexity(ast: ASTWithSource): number {
  const expression = ast.source !== null ? ast.source.replace(/\s/g, '') : '';
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
