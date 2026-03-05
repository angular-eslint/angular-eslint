import {
  AST,
  Binary,
  TemplateLiteral,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  isLiteralPrimitive,
  isStringLiteralPrimitive,
  Quote,
} from '../utils/literal-primitive';
import { unwrapParenthesizedExpression } from '../utils/unwrap-parenthesized-expression';

const messageId = 'preferTemplateLiteral';

export type Options = [];
export type MessageIds = typeof messageId;
export const RULE_NAME = 'prefer-template-literal';

/**
 * Part of a concatenation chain - either a literal value that can be inlined,
 * or an expression that needs ${} interpolation.
 */
type ConcatPart =
  | { type: 'literal'; value: string }
  | { type: 'expression'; node: AST };

/**
 * Check if this node is part of a larger Binary + chain.
 * If so, we should skip and let the topmost node handle it.
 */
function isPartOfLargerBinaryChain(node: Binary): boolean {
  if (!('parent' in node)) return false;
  const parent = node.parent;

  // If parent is a Binary +, we're part of a larger chain
  return parent instanceof Binary && parent.operation === '+';
}

/**
 * Check if a Binary + chain contains at least one string literal anywhere.
 * This recursively checks the entire tree.
 */
function chainContainsString(node: AST): boolean {
  const unwrapped = unwrapParenthesizedExpression(node);

  if (
    isStringLiteralPrimitive(unwrapped) ||
    unwrapped instanceof TemplateLiteral
  ) {
    return true;
  }

  if (unwrapped instanceof Binary && unwrapped.operation === '+') {
    return (
      chainContainsString(unwrapped.left) ||
      chainContainsString(unwrapped.right)
    );
  }

  return false;
}

/**
 * Flatten a Binary + tree into a list of parts.
 * This recursively collects all operands in a left-to-right order.
 */
function flattenBinaryConcat(node: AST): readonly ConcatPart[] {
  const unwrapped = unwrapParenthesizedExpression(node);

  if (
    unwrapped instanceof Binary &&
    unwrapped.operation === '+' &&
    chainContainsString(unwrapped)
  ) {
    // Recursively flatten both sides
    return [
      ...flattenBinaryConcat(unwrapped.left),
      ...flattenBinaryConcat(unwrapped.right),
    ];
  }

  if (unwrapped instanceof TemplateLiteral) {
    // Flatten template literals by interleaving string elements and expressions
    const parts: ConcatPart[] = [];
    for (let i = 0; i < unwrapped.elements.length; i++) {
      // Add the string part from the element's text
      if (unwrapped.elements[i].text) {
        parts.push({ type: 'literal', value: unwrapped.elements[i].text });
      }
      // Add the expression part (if exists)
      if (i < unwrapped.expressions.length) {
        parts.push({ type: 'expression', node: unwrapped.expressions[i] });
      }
    }
    return parts;
  }

  if (isLiteralPrimitive(unwrapped)) {
    // Convert the literal to a string
    const value =
      typeof unwrapped.value === 'string'
        ? unwrapped.value
        : String(unwrapped.value);
    return [{ type: 'literal', value }];
  }

  // Any other expression - use the unwrapped node (without parentheses)
  return [{ type: 'expression', node: unwrapped }];
}

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
        // Skip if this node is part of a larger Binary + chain
        // Let the topmost node handle the entire chain
        if (isPartOfLargerBinaryChain(node)) {
          return;
        }

        // Check if this Binary + chain contains at least one string
        // This handles cases where the immediate operands aren't strings,
        // but nested operands are (e.g., x.type + "" + y)
        if (!chainContainsString(node)) {
          return;
        }

        const {
          sourceSpan: { start, end },
        } = node;

        const parentIsTemplateLiteral =
          'parent' in node && node.parent instanceof TemplateLiteral;

        // Flatten the entire concatenation chain
        const parts = flattenBinaryConcat(node);
        const allLiterals = parts.every((p) => p.type === 'literal');

        function getQuote(): Quote | '' {
          if (parentIsTemplateLiteral) {
            return '';
          }

          // If there are any expression parts, we need backticks
          if (!allLiterals) {
            return '`';
          }

          // All parts are literals - try to preserve the original quote style
          // Search the source for the first string literal quote
          const sourceText = sourceCode.text.slice(start, end);
          for (const char of sourceText) {
            if (char === "'" || char === '"') {
              return char;
            }
            if (char === '`') {
              // If original had template literal, keep backticks
              return '`';
            }
          }

          // No string quotes found (all numbers/booleans/etc) - use single quote
          return "'";
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

            // Build the replacement string from all parts
            const effectiveQuote = quote === '' ? '`' : quote;
            let replacement = '';

            for (const part of parts) {
              if (part.type === 'literal') {
                // Escape the quote character in the value
                replacement += part.value.replaceAll(
                  effectiveQuote,
                  `\\${effectiveQuote}`,
                );
              } else {
                // Expression - wrap in ${}
                const exprText = sourceCode.text.slice(
                  part.node.sourceSpan.start,
                  part.node.sourceSpan.end,
                );
                replacement += `\${${exprText}}`;
              }
            }

            // Add quotes if not inside a template literal
            if (!parentIsTemplateLiteral) {
              replacement = `${quote}${replacement}${quote}`;
            }

            fixes.push(fixer.replaceTextRange([start, end], replacement));

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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Template literals (backticks with ${} syntax) are more modern, readable, and maintainable than string concatenation with the + operator. String concatenation like "Hello " + name + "!" is harder to read and error-prone (easy to forget spaces or quotes) compared to the template literal `Hello ${name}!`. Template literals make string composition clearer, especially with multiple expressions. This is a widely accepted JavaScript/TypeScript best practice that should be followed in Angular templates for consistency. Angular templates have supported template literal syntax since v19.2. Using template literals throughout your codebase creates a consistent style and makes complex string building much more readable.',
};
