import {
  AST,
  LiteralPrimitive,
  ParenthesizedExpression,
  TemplateLiteral,
  type Binary,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getLiteralPrimitiveStringValue,
  isLiteralPrimitive,
  isStringLiteralPrimitive,
} from '../utils/literal-primitive';
import { unwrapParenthesizedExpression } from '../utils/unwrap-parenthesized-expression';

const messageId = 'preferTemplateLiteral';

export type Options = [];
export type MessageIds = typeof messageId;
export const RULE_NAME = 'prefer-template-literal';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure that template literals are used instead of concatenating strings or expressions.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferTemplateLiteral:
        'Prefer using template literal instead of concatenating strings or expressions',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const { sourceCode } = context;

    return {
      'Binary[operation="+"]'(node: Binary) {
        const originalLeft = node.left;
        const originalRight = node.right;
        const left = unwrapParenthesizedExpression(originalLeft);
        const right = unwrapParenthesizedExpression(originalRight);

        const isLeftString =
          isStringLiteralPrimitive(left) || left instanceof TemplateLiteral;
        const isRightString =
          isStringLiteralPrimitive(right) || right instanceof TemplateLiteral;

        // If both sides are not strings, we don't report anything
        if (!isLeftString && !isRightString) {
          return;
        }

        const {
          sourceSpan: { start, end },
        } = node;

        function getQuote(): '"' | "'" | '`' {
          const leftValue = sourceCode.text.at(left.sourceSpan.start);
          if (leftValue === "'" || leftValue === '"') {
            return leftValue;
          }
          const rightValue = sourceCode.text.at(right.sourceSpan.start);
          if (rightValue === "'" || rightValue === '"') {
            return rightValue;
          }
          return '`';
        }

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId,
          fix: (fixer) => {
            // If both sides are literals, we remove the `+` sign, escape if necessary and concatenate them
            if (
              left instanceof LiteralPrimitive &&
              right instanceof LiteralPrimitive
            ) {
              const quote = getQuote();
              return fixer.replaceTextRange(
                [start, end],
                `${quote}${getLiteralPrimitiveStringValue(left, quote)}${getLiteralPrimitiveStringValue(right, quote)}${quote}`,
              );
            }

            const fixes = Array<RuleFix>();

            // Fix the left side - handle parenthesized expressions specially
            if (originalLeft instanceof ParenthesizedExpression) {
              fixes.push(
                ...getLeftSideFixesForParenthesized(fixer, left, originalLeft),
              );
            } else {
              fixes.push(...getLeftSideFixes(fixer, left));
            }

            // Remove the `+` sign (including surrounding whitespace)
            fixes.push(
              fixer.removeRange([
                originalLeft.sourceSpan.end,
                originalRight.sourceSpan.start,
              ]),
            );

            // Fix the right side - handle parenthesized expressions specially
            if (originalRight instanceof ParenthesizedExpression) {
              // For parenthesized expressions, we want to replace the whole thing including parens
              fixes.push(
                ...getRightSideFixesForParenthesized(
                  fixer,
                  right,
                  originalRight,
                ),
              );
            } else {
              fixes.push(...getRightSideFixes(fixer, right));
            }

            return fixes;
          },
        });
      },
    };
  },
});

function getLeftSideFixes(fixer: RuleFixer, left: AST): readonly RuleFix[] {
  const { start, end } = left.sourceSpan;

  if (left instanceof TemplateLiteral) {
    // Remove the end ` sign from the left side
    return [fixer.removeRange([end - 1, end])];
  }

  if (isLiteralPrimitive(left)) {
    // Transform left side to template literal
    return [
      fixer.replaceTextRange(
        [start, end],
        `\`${getLiteralPrimitiveStringValue(left, '`')}`,
      ),
    ];
  }

  // Transform left side to template literal
  return [
    fixer.insertTextBeforeRange([start, end], '`${'),
    fixer.insertTextAfterRange([start, end], '}'),
  ];
}

function getLeftSideFixesForParenthesized(
  fixer: RuleFixer,
  innerExpression: AST,
  parenthesizedExpression: ParenthesizedExpression,
): readonly RuleFix[] {
  const parenthesizedStart = parenthesizedExpression.sourceSpan.start;
  const parenthesizedEnd = parenthesizedExpression.sourceSpan.end;
  const innerStart = innerExpression.sourceSpan.start;
  const innerEnd = innerExpression.sourceSpan.end;

  if (innerExpression instanceof TemplateLiteral) {
    // Remove the end ` sign from the inner expression and remove the parentheses
    return [
      fixer.removeRange([parenthesizedStart, innerStart]), // Remove opening paren
      fixer.removeRange([innerEnd - 1, innerEnd]), // Remove closing backtick
      fixer.removeRange([innerEnd, parenthesizedEnd]), // Remove closing paren
    ];
  }

  if (isLiteralPrimitive(innerExpression)) {
    // Transform to template literal and remove parentheses
    return [
      fixer.replaceTextRange(
        [parenthesizedStart, parenthesizedEnd],
        `\`${getLiteralPrimitiveStringValue(innerExpression, '`')}`,
      ),
    ];
  }

  // Transform parenthesized expression to template literal by removing parens and wrapping in ${}
  return [
    fixer.replaceTextRange([parenthesizedStart, innerStart], '`${'), // Replace opening paren with `${
    fixer.replaceTextRange([innerEnd, parenthesizedEnd], '}'), // Replace closing paren with }
  ];
}

function getRightSideFixes(fixer: RuleFixer, right: AST): readonly RuleFix[] {
  const { start, end } = right.sourceSpan;

  if (right instanceof TemplateLiteral) {
    // Remove the start ` sign from the right side
    return [fixer.removeRange([start, start + 1])];
  }

  if (isLiteralPrimitive(right)) {
    // Transform right side to template literal if it's a string
    return [
      fixer.replaceTextRange(
        [start, end],
        `${getLiteralPrimitiveStringValue(right, '`')}\``,
      ),
    ];
  }

  // Transform right side to template literal
  return [
    fixer.insertTextBeforeRange([start, end], '${'),
    fixer.insertTextAfterRange([start, end], '}`'),
  ];
}

function getRightSideFixesForParenthesized(
  fixer: RuleFixer,
  innerExpression: AST,
  parenthesizedExpression: ParenthesizedExpression,
): readonly RuleFix[] {
  const parenthesizedStart = parenthesizedExpression.sourceSpan.start;
  const parenthesizedEnd = parenthesizedExpression.sourceSpan.end;
  const innerStart = innerExpression.sourceSpan.start;
  const innerEnd = innerExpression.sourceSpan.end;

  if (innerExpression instanceof TemplateLiteral) {
    // Remove the start ` sign from the inner expression and remove the parentheses
    return [
      fixer.removeRange([parenthesizedStart, innerStart]), // Remove opening paren
      fixer.removeRange([innerStart, innerStart + 1]), // Remove opening backtick
      fixer.removeRange([innerEnd, parenthesizedEnd]), // Remove closing paren
    ];
  }

  if (isLiteralPrimitive(innerExpression)) {
    // Transform to template literal and remove parentheses
    return [
      fixer.replaceTextRange(
        [parenthesizedStart, parenthesizedEnd],
        `${getLiteralPrimitiveStringValue(innerExpression, '`')}\``,
      ),
    ];
  }

  // Transform parenthesized expression to template literal by removing parens and wrapping in ${}
  return [
    fixer.replaceTextRange([parenthesizedStart, innerStart], '${'), // Replace opening paren with ${
    fixer.replaceTextRange([innerEnd, parenthesizedEnd], '}`'), // Replace closing paren with }`
  ];
}
