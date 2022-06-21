import type {
  AST,
  ASTWithSource,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  Binary,
  BindingPipe,
  Conditional,
  Interpolation,
  Lexer,
  Parser,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [{ maxComplexity: number }];
export type MessageIds = 'conditionalComplexity';
export const RULE_NAME = 'conditional-complexity';

const DEFAULT_MAX_COMPLEXITY = 5;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'The conditional complexity should not exceed a rational limit',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxComplexity: {
            minimum: 1,
            type: 'number',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      conditionalComplexity:
        'The conditional complexity {{totalComplexity}} exceeds the defined limit {{maxComplexity}}',
    },
  },
  defaultOptions: [{ maxComplexity: DEFAULT_MAX_COMPLEXITY }],
  create(context, [{ maxComplexity }]) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      BoundAttribute(node: TmplAstBoundAttribute & { value: ASTWithSource }) {
        if (!node.value.source || node.value.ast instanceof Interpolation) {
          return;
        }

        const possibleBinary = extractPossibleBinaryOrConditionalFrom(
          getParser().parseBinding(node.value.source, '', 0).ast,
        );
        const totalComplexity = getTotalComplexity(possibleBinary);

        if (totalComplexity <= maxComplexity) {
          return;
        }

        const {
          sourceSpan: { start, end },
        } = node.value;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'conditionalComplexity',
          data: { maxComplexity, totalComplexity },
        });
      },
      Interpolation({ expressions }: Interpolation) {
        for (const expression of expressions) {
          const totalComplexity = getTotalComplexity(expression);

          if (totalComplexity <= maxComplexity) {
            continue;
          }

          const {
            sourceSpan: { start, end },
          } = expression;

          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(start),
              end: sourceCode.getLocFromIndex(end),
            },
            messageId: 'conditionalComplexity',
            data: { maxComplexity, totalComplexity },
          });
        }
      },
    };
  },
});

function extractPossibleBinaryOrConditionalFrom(node: AST): AST {
  return node instanceof BindingPipe ? node.exp : node;
}

let parser: Parser | null = null;
// Instantiate the `Parser` class lazily only when this rule is applied.
function getParser(): Parser {
  return parser || (parser = new Parser(new Lexer()));
}

function getTotalComplexity(ast: AST): number {
  const possibleBinaryOrConditional =
    extractPossibleBinaryOrConditionalFrom(ast);

  if (
    !(
      possibleBinaryOrConditional instanceof Binary ||
      possibleBinaryOrConditional instanceof Conditional
    )
  ) {
    return 0;
  }

  let total = 1;

  if (possibleBinaryOrConditional instanceof Binary) {
    if (possibleBinaryOrConditional.left instanceof Binary) {
      total += getTotalComplexity(possibleBinaryOrConditional.left);
    }

    if (possibleBinaryOrConditional.right instanceof Binary) {
      total += getTotalComplexity(possibleBinaryOrConditional.right);
    }
  }

  if (possibleBinaryOrConditional instanceof Conditional) {
    total +=
      getTotalComplexity(possibleBinaryOrConditional.condition) +
      getTotalComplexity(possibleBinaryOrConditional.trueExp) +
      getTotalComplexity(possibleBinaryOrConditional.falseExp);
  }

  return total;
}
