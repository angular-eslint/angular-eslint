import type { AST, Binary } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralPrimitive,
  Interpolation,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import type { TSESLint } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
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
      recommended: 'recommended',
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
    const sourceCode = context.sourceCode;

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
                fix: (fixer) => getFix({ node, right, end, sourceCode, fixer }),
              }
            : {
                suggest: [
                  {
                    messageId: 'suggestStrictEquality',
                    fix: (fixer) =>
                      getFix({ node, right, end, sourceCode, fixer }),
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
  right,
  end,
  sourceCode,
  fixer,
}: {
  node: Binary;
  right: AST;
  end: number;
  sourceCode: Readonly<TSESLint.SourceCode>;
  fixer: TSESLint.RuleFixer;
}): TSESLint.RuleFix | null => {
  const { source, ast } = getNearestNodeFrom(
    node,
    isASTWithSource,
  ) as ASTWithSource & { ast: unknown };

  if (!source) return null;

  let startOffet = 0;
  while (!isInterpolation(ast) && isLeadingTriviaChar(source[startOffet])) {
    startOffet++;
  }

  const endRange = end - startOffet - getSpanLength(right) - 1;
  let eqOffset = 0;

  while (sourceCode.text[endRange - eqOffset] !== '=') {
    eqOffset++;
  }

  return fixer.insertTextAfterRange(
    [endRange - eqOffset, endRange - eqOffset],
    '=',
  );
};

function isLeadingTriviaChar(char: string) {
  return char === '\n' || char === ' ';
}

function isASTWithSource(node: unknown): node is ASTWithSource {
  return node instanceof ASTWithSource;
}

function isLiteralPrimitive(node: unknown): node is LiteralPrimitive {
  return node instanceof LiteralPrimitive;
}

function isInterpolation(node: unknown): node is Interpolation {
  return node instanceof Interpolation;
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
