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
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { unwrapParenthesizedExpression } from '../utils/unwrap-parenthesized-expression';

export type Options = [{ maxComplexity: number }];
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
    const sourceCode = context.sourceCode;

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
  const unwrapped = unwrapParenthesizedExpression(node);
  return unwrapped instanceof BindingPipe ? unwrapped.exp : unwrapped;
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
    const leftUnwrapped = unwrapParenthesizedExpression(
      possibleBinaryOrConditional.left,
    );
    const rightUnwrapped = unwrapParenthesizedExpression(
      possibleBinaryOrConditional.right,
    );

    if (
      leftUnwrapped instanceof Binary ||
      leftUnwrapped instanceof Conditional
    ) {
      total += getTotalComplexity(possibleBinaryOrConditional.left);
    }

    if (
      rightUnwrapped instanceof Binary ||
      rightUnwrapped instanceof Conditional
    ) {
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
