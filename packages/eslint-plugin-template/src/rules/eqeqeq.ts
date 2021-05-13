import type { AST, Binary } from '@angular/compiler';
import { ASTWithSource, LiteralPrimitive } from '@angular/compiler';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';

type Options = [{ readonly allowNullOrUndefined?: boolean }];
export type MessageIds = 'eqeqeq';
export const RULE_NAME = 'eqeqeq';
const DEFAULT_OPTIONS: Options[0] = { allowNullOrUndefined: false };

export default createESLintRule<Options, MessageIds>({
  name: 'eqeqeq',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires `===` and `!==` in place of `==` and `!=`',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowNullOrUndefined: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowNullOrUndefined,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      eqeqeq:
        'Expected `{{expectedOperation}}` but received `{{actualOperation}}`',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowNullOrUndefined }]) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    return {
      'Binary[operation=/^(==|!=)$/]'(node: Binary) {
        const {
          left,
          operation,
          right,
          sourceSpan: { start, end },
        } = node;
        const isNilComparison = [left, right].some(isNilValue);

        if (allowNullOrUndefined && isNilComparison) return;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'eqeqeq',
          data: {
            actualOperation: operation,
            expectedOperation: `${operation}=`,
          },
          fix: (fixer) => {
            const { source } = getNearestNodeFrom(node, isASTWithSource) ?? {};

            if (!source) return [];

            return fixer.insertTextAfterRange(
              [start + getSpanLength(left) + 1, end - getSpanLength(right) - 1],
              '=',
            );
          },
        });
      },
    };
  },
});

function getSpanLength({ span: { start, end } }: AST): number {
  return end - start;
}

function isASTWithSource(node: unknown): node is ASTWithSource {
  return node instanceof ASTWithSource;
}

function isNilValue(ast: AST): ast is LiteralPrimitive {
  return (
    ast instanceof LiteralPrimitive &&
    (ast.value === null || ast.value === undefined)
  );
}
