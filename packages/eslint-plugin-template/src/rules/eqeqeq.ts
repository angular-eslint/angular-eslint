import type { AST, Binary } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralPrimitive,
} from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint } from '@typescript-eslint/utils';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';

type Options = [{ readonly allowNullOrUndefined?: boolean }];
export type MessageIds = 'eqeqeq' | 'suggestStrictEquality';
export const RULE_NAME = 'eqeqeq';
const DEFAULT_OPTIONS: Options[0] = { allowNullOrUndefined: false };

export default createESLintRule<Options, MessageIds>({
  name: 'eqeqeq',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires `===` and `!==` in place of `==` and `!=`',
      recommended: 'error',
    },
    hasSuggestions: true,
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
      suggestStrictEquality:
        'Replace `{{actualOperation}}` with `{{expectedOperation}}`',
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

        if (allowNullOrUndefined && (isNilValue(left) || isNilValue(right))) {
          return;
        }

        const data = {
          actualOperation: operation,
          expectedOperation: `${operation}=`,
        } as const;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'eqeqeq',
          data,
          ...(isStringNonNumericValue(left) || isStringNonNumericValue(right)
            ? {
                fix: (fixer) =>
                  getFix({ node, left, right, start, end, fixer }),
              }
            : {
                suggest: [
                  {
                    messageId: 'suggestStrictEquality',
                    fix: (fixer) =>
                      getFix({ node, left, right, start, end, fixer }),
                    data,
                  },
                ],
              }),
        });
      },
    };
  },
});

function getSpanLength({ span: { start, end } }: AST): number {
  return end - start;
}

const getFix = ({
  node,
  left,
  right,
  start,
  end,
  fixer,
}: {
  node: Binary;
  left: AST;
  right: AST;
  start: number;
  end: number;
  fixer: TSESLint.RuleFixer;
}): TSESLint.RuleFix | null => {
  const { source } = getNearestNodeFrom(node, isASTWithSource) ?? {};

  if (!source) return null;

  return fixer.insertTextAfterRange(
    [start + getSpanLength(left) + 1, end - getSpanLength(right) - 1],
    '=',
  );
};

function isASTWithSource(node: unknown): node is ASTWithSource {
  return node instanceof ASTWithSource;
}

function isLiteralPrimitive(node: unknown): node is LiteralPrimitive {
  return node instanceof LiteralPrimitive;
}

function isNumeric(value: unknown): value is number | string {
  return (
    !Number.isNaN(Number.parseFloat(String(value))) &&
    Number.isFinite(Number(value))
  );
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringNonNumericValue(
  ast: AST,
): ast is LiteralPrimitive & { value: string } {
  return (
    isLiteralPrimitive(ast) && isString(ast.value) && !isNumeric(ast.value)
  );
}

function isNilValue(
  ast: AST,
): ast is LiteralPrimitive & { value: null | undefined } {
  return (
    isLiteralPrimitive(ast) && (ast.value === null || ast.value === undefined)
  );
}
