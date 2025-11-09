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
  Quote,
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

        const parentIsTemplateLiteral =
          'parent' in node && node.parent instanceof TemplateLiteral;

        function getQuote(): Quote | '' {
          if (parentIsTemplateLiteral) {
            return '';
          }

          // If either side is not a literal primitive, we need to use backticks for interpolation
          if (!isLiteralPrimitive(left) || !isLiteralPrimitive(right)) {
            return '`';
          }

          if (
            left instanceof LiteralPrimitive &&
            right instanceof LiteralPrimitive
          ) {
            const leftValue = sourceCode.text.at(left.sourceSpan.start);
            if (leftValue === "'" || leftValue === '"') {
              return leftValue;
            }
            const rightValue = sourceCode.text.at(right.sourceSpan.start);
            if (rightValue === "'" || rightValue === '"') {
              return rightValue;
            }
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
            const quote = getQuote();

            const fixes = Array<RuleFix>();

            // If the parent is a template literal, remove the `${` sign
            if (parentIsTemplateLiteral) {
              const templateInterpolationStartIndex =
                sourceCode.text.lastIndexOf('${', node.sourceSpan.start);
              fixes.push(
                fixer.removeRange([
                  templateInterpolationStartIndex,
                  node.sourceSpan.start,
                ]),
              );
            }

            // If both sides are literals, we remove the `+` sign, escape if necessary and concatenate them
            if (
              left instanceof LiteralPrimitive &&
              right instanceof LiteralPrimitive
            ) {
              fixes.push(
                fixer.replaceTextRange(
                  [start, end],
                  parentIsTemplateLiteral
                    ? `${getLiteralPrimitiveStringValue(left, '`')}${getLiteralPrimitiveStringValue(right, '`')}`
                    : `${quote}${getLiteralPrimitiveStringValue(left, quote as Quote)}${getLiteralPrimitiveStringValue(right, quote as Quote)}${quote}`,
                ),
              );
            } else {
              // Fix the left side - handle parenthesized expressions specially
              if (originalLeft instanceof ParenthesizedExpression) {
                fixes.push(
                  ...getLeftSideFixesForParenthesized(
                    fixer,
                    left,
                    originalLeft,
                    quote,
                  ),
                );
              } else {
                fixes.push(...getLeftSideFixes(fixer, left, quote));
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
                    quote,
                  ),
                );
              } else {
                fixes.push(...getRightSideFixes(fixer, right, quote));
              }
            }

            // If the parent is a template literal, remove the `}` sign
            if (parentIsTemplateLiteral) {
              const templateInterpolationEndIndex = sourceCode.text.indexOf(
                '}',
                node.sourceSpan.end,
              );
              fixes.push(
                fixer.removeRange([
                  node.sourceSpan.end,
                  templateInterpolationEndIndex + 1,
                ]),
              );
            }

            return fixes;
          },
        });
      },
    };
  },
});

function getLeftSideFixes(
  fixer: RuleFixer,
  left: AST,
  quote: Quote | '',
): readonly RuleFix[] {
  const { start, end } = left.sourceSpan;

  if (left instanceof TemplateLiteral) {
    // Remove the end ` sign from the left side
    return [
      fixer.replaceTextRange([start, start + 1], quote),
      fixer.removeRange([end - 1, end]),
    ];
  }

  if (isLiteralPrimitive(left)) {
    // Transform left side to template literal
    return [
      fixer.replaceTextRange(
        [start, end],
        quote === ''
          ? `${getLiteralPrimitiveStringValue(left, '`')}`
          : `${quote}${getLiteralPrimitiveStringValue(left, quote as Quote)}`,
      ),
    ];
  }

  // Transform left side to template literal
  return [
    fixer.insertTextBeforeRange([start, end], `${quote}\${`),
    fixer.insertTextAfterRange([start, end], '}'),
  ];
}

function getLeftSideFixesForParenthesized(
  fixer: RuleFixer,
  innerExpression: AST,
  parenthesizedExpression: ParenthesizedExpression,
  quote: Quote | '',
): readonly RuleFix[] {
  const parenthesizedStart = parenthesizedExpression.sourceSpan.start;
  const parenthesizedEnd = parenthesizedExpression.sourceSpan.end;
  const innerStart = innerExpression.sourceSpan.start;
  const innerEnd = innerExpression.sourceSpan.end;

  if (innerExpression instanceof TemplateLiteral) {
    // Remove the end ` sign from the inner expression and remove the parentheses
    return [
      fixer.replaceTextRange([parenthesizedStart, innerStart + 1], quote), // Replace opening paren and backtick with quote
      fixer.removeRange([innerEnd - 1, parenthesizedEnd]), // Remove closing backtick and paren
    ];
  }

  if (isLiteralPrimitive(innerExpression)) {
    // Transform to template literal and remove parentheses
    return [
      fixer.replaceTextRange(
        [parenthesizedStart, parenthesizedEnd],
        quote === ''
          ? `${getLiteralPrimitiveStringValue(innerExpression, '`')}`
          : `${quote}${getLiteralPrimitiveStringValue(innerExpression, quote as Quote)}`,
      ),
    ];
  }

  // Transform parenthesized expression to template literal by removing parens and wrapping in ${}
  return [
    fixer.replaceTextRange([parenthesizedStart, innerStart], `${quote}\${`), // Replace opening paren with quote${
    fixer.replaceTextRange([innerEnd, parenthesizedEnd], '}'), // Replace closing paren with }
  ];
}

function getRightSideFixes(
  fixer: RuleFixer,
  right: AST,
  quote: Quote | '',
): readonly RuleFix[] {
  const { start, end } = right.sourceSpan;

  if (right instanceof TemplateLiteral) {
    // Remove the start ` sign from the right side
    return [
      fixer.removeRange([start, start + 1]),
      fixer.replaceTextRange([end - 1, end], quote),
    ];
  }

  if (isLiteralPrimitive(right)) {
    // Transform right side to template literal if it's a string
    return [
      fixer.replaceTextRange(
        [start, end],
        quote === ''
          ? `${getLiteralPrimitiveStringValue(right, '`')}`
          : `${getLiteralPrimitiveStringValue(right, quote as Quote)}${quote}`,
      ),
    ];
  }

  // Transform right side to template literal
  return [
    fixer.insertTextBeforeRange([start, end], '${'),
    fixer.insertTextAfterRange([start, end], `}${quote}`),
  ];
}

function getRightSideFixesForParenthesized(
  fixer: RuleFixer,
  innerExpression: AST,
  parenthesizedExpression: ParenthesizedExpression,
  quote: Quote | '',
): readonly RuleFix[] {
  const parenthesizedStart = parenthesizedExpression.sourceSpan.start;
  const parenthesizedEnd = parenthesizedExpression.sourceSpan.end;
  const innerStart = innerExpression.sourceSpan.start;
  const innerEnd = innerExpression.sourceSpan.end;

  if (innerExpression instanceof TemplateLiteral) {
    // Remove the start ` sign from the inner expression and remove the parentheses
    return [
      fixer.removeRange([parenthesizedStart, innerStart + 1]), // Remove opening paren and backtick
      fixer.replaceTextRange([innerEnd - 1, parenthesizedEnd], quote), // Replace closing backtick and paren with quote
    ];
  }

  if (isLiteralPrimitive(innerExpression)) {
    // Transform to template literal and remove parentheses
    return [
      fixer.replaceTextRange(
        [parenthesizedStart, parenthesizedEnd],
        quote === ''
          ? `${getLiteralPrimitiveStringValue(innerExpression, '`')}`
          : `${getLiteralPrimitiveStringValue(innerExpression, quote as Quote)}${quote}`,
      ),
    ];
  }

  // Transform parenthesized expression to template literal by removing parens and wrapping in ${}
  return [
    fixer.replaceTextRange([parenthesizedStart, innerStart], '${'), // Replace opening paren with ${
    fixer.replaceTextRange([innerEnd, parenthesizedEnd], `}${quote}`), // Replace closing paren with }quote
  ];
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Template literals (backticks with ${} syntax) are more modern, readable, and maintainable than string concatenation with the + operator. String concatenation like "Hello " + name + "!" is harder to read and error-prone (easy to forget spaces or quotes) compared to the template literal `Hello ${name}!`. Template literals make string composition clearer, especially with multiple expressions. This is a widely accepted JavaScript/TypeScript best practice that should be followed in Angular templates for consistency. Angular templates have supported template literal syntax since early versions. Using template literals throughout your codebase creates a consistent style and makes complex string building much more readable.',
};
