import {
  AST,
  LiteralPrimitive,
  TemplateLiteral,
  type Binary,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getLiteralPrimitiveStringValue,
  isLiteralPrimitive,
  isStringLiteralPrimitive,
  Quote,
} from '../utils/literal-primitive';
import { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';

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
        const { left, right } = node;

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

        function getLeftSideFixes(
          fixer: RuleFixer,
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
                parentIsTemplateLiteral
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

        function getRightSideFixes(
          fixer: RuleFixer,
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
                parentIsTemplateLiteral
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

        function hasParentheses(node: AST): boolean {
          const { start, end } = node.sourceSpan;
          const text = sourceCode.text.slice(start - 1, end + 1);

          return text.startsWith('(') && text.endsWith(')');
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
              const leftHasParentheses = hasParentheses(left);
              const rightHasParentheses = hasParentheses(right);

              // Remove the left first parenthesis if it exists
              if (leftHasParentheses) {
                fixes.push(
                  fixer.removeRange([
                    left.sourceSpan.start - 1,
                    left.sourceSpan.start,
                  ]),
                );
              }

              // Fix the left side
              fixes.push(...getLeftSideFixes(fixer, quote));

              // Remove the left last parenthesis if it exists
              if (leftHasParentheses) {
                fixes.push(
                  fixer.removeRange([
                    left.sourceSpan.end,
                    left.sourceSpan.end + 1,
                  ]),
                );
              }

              // Remove the `+` sign
              fixes.push(
                fixer.removeRange([
                  leftHasParentheses
                    ? left.sourceSpan.end + 1
                    : left.sourceSpan.end,
                  rightHasParentheses
                    ? right.sourceSpan.start - 1
                    : right.sourceSpan.start,
                ]),
              );

              // Remove the right first parenthesis if it exists
              if (rightHasParentheses) {
                fixes.push(
                  fixer.removeRange([
                    right.sourceSpan.start - 1,
                    right.sourceSpan.start,
                  ]),
                );
              }

              // Fix the right side
              fixes.push(...getRightSideFixes(fixer, quote));

              // Remove the right last parenthesis if it exists
              if (rightHasParentheses) {
                fixes.push(
                  fixer.removeRange([
                    right.sourceSpan.end,
                    right.sourceSpan.end + 1,
                  ]),
                );
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
