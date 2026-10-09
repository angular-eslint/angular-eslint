import type {
  AST,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  Binary,
  Conditional,
  LiteralMap,
  ParenthesizedExpression,
} from '@angular-eslint/bundled-angular-compiler';
import { createESLintRule } from '../utils/create-eslint-rule';
import { splitMultiTokenKey } from '../utils/split-multi-token-key';

type Options = [];

export type MessageIds = 'multiTokenKey' | 'splitKey';
export const RULE_NAME = 'no-multi-token-class-key';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows object keys containing whitespace in `[class]` bindings, which Angular silently ignores',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      multiTokenKey:
        'Object keys in a `[class]` binding are single class names. A key containing whitespace matches no class and is silently ignored by Angular.',
      splitKey: 'Split into one key per class, each with the same condition.',
    },
    defaultOptions: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const sourceText = sourceCode.getText();

    return {
      'BoundAttribute[name="class"]'(node: TmplAstBoundAttribute) {
        // `[attr.class]` also has the name `class`; only the key span tells them apart.
        if (
          node.keySpan?.toString() !== 'class' ||
          !(node.value instanceof ASTWithSource)
        ) {
          return;
        }

        for (const map of collectClassMaps(node.value.ast)) {
          map.keys.forEach((key, index) => {
            if (key.kind !== 'property' || !isMultiTokenKey(key.key)) {
              return;
            }

            const { start, end } = key.sourceSpan;
            const value = map.values[index];

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId: 'multiTokenKey',
              suggest: [
                {
                  messageId: 'splitKey',
                  fix: (fixer) =>
                    fixer.replaceTextRange(
                      [start, value.sourceSpan.end],
                      splitMultiTokenKey(
                        key.key,
                        key.quoted ? sourceText[start] : null,
                        sourceText.slice(
                          value.sourceSpan.start,
                          value.sourceSpan.end,
                        ),
                      ),
                    ),
                },
              ],
            });
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Angular reads each key of an object bound to `[class]` as a single class name. When a key contains a space (for example `{ 'text-x dark:text-y': cond }`), Angular's styling runtime discards the key without any build error or runtime warning, even in development mode, so the element gets neither class. A tab or newline inside a key is worse: it reaches `classList.add`, which throws at runtime. This usually happens when a variant is appended to an existing key, or when migrating from `[ngClass]`, which does split keys on whitespace and is therefore not affected. This rule complements `prefer-class-binding`, which declines to suggest `[class]` for such keys but never inspects existing `[class]` bindings. Maps built in the component class and bound by reference (`[class]=\"classMap\"`) cannot be checked.",
};

function isMultiTokenKey(key: string): boolean {
  return /\s/.test(key) && /\S/.test(key);
}

/**
 * Returns the object literals that Angular would apply as the class map:
 * the expression itself, either branch of a ternary, or either side of
 * `??` / `||`, looking through parentheses. Maps in value positions
 * (function arguments, object values) are not class maps.
 */
function collectClassMaps(ast: AST): LiteralMap[] {
  while (ast instanceof ParenthesizedExpression) {
    ast = ast.expression;
  }

  if (ast instanceof LiteralMap) {
    return [ast];
  }

  if (ast instanceof Conditional) {
    return [
      ...collectClassMaps(ast.trueExp),
      ...collectClassMaps(ast.falseExp),
    ];
  }

  if (
    ast instanceof Binary &&
    (ast.operation === '??' || ast.operation === '||')
  ) {
    return [...collectClassMaps(ast.left), ...collectClassMaps(ast.right)];
  }

  return [];
}
