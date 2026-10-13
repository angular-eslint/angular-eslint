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

export type MessageIds = 'spaceInKey' | 'tabOrNewlineInKey' | 'splitKey';
export const RULE_NAME = 'no-multi-token-class-key';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows whitespace in object keys of `[class]` bindings, which makes Angular silently drop the key or the browser throw',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      spaceInKey:
        'Object keys in a `[class]` binding are single class names. Angular silently drops a key that contains a space, so none of its classes are applied.',
      tabOrNewlineInKey:
        'Object keys in a `[class]` binding are single class names. A key that contains a tab or newline is passed to `classList.add`, which throws an `InvalidCharacterError` at runtime.',
      splitKey: 'Split into one key per class, each with the same condition.',
    },
    defaultOptions: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const sourceText = sourceCode.getText();

    return {
      'BoundAttribute[name="class"]'(node: TmplAstBoundAttribute) {
        // `[class]` and `bind-class` have the key span `class`, whereas
        // `[attr.class]` and `bind-attr.class` share the name `class` too.
        if (
          node.keySpan?.toString() !== 'class' ||
          !(node.value instanceof ASTWithSource)
        ) {
          return;
        }

        for (const map of collectClassMaps(node.value.ast)) {
          map.keys.forEach((key, index) => {
            if (key.kind !== 'property') {
              return;
            }

            const messageId = getMessageId(key.key);
            if (!messageId) {
              return;
            }

            const { start, end } = key.sourceSpan;
            const value = map.values[index];

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId,
              // A key made only of whitespace holds no class to split into.
              suggest: hasClassToken(key.key)
                ? [
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
                  ]
                : [],
            });
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Angular reads each key of an object bound to `[class]` (or `bind-class`) as a single class name and handles whitespace inside a key in one of two ways. A key that contains a space (for example `{ 'text-x dark:text-y': cond }`) is discarded by Angular's styling runtime without any build error or runtime warning, even in development mode, so the element gets none of its classes. A key that contains a tab or newline but no space is not filtered out: it reaches `classList.add`, which throws an `InvalidCharacterError` at runtime. This usually happens when a variant is appended to an existing key, or when migrating from `[ngClass]`, which does split keys on whitespace and is therefore not affected. Keys made only of spaces are dropped without losing any class, so they are not reported. This rule complements `prefer-class-binding`, which declines to suggest `[class]` for such keys but never inspects existing `[class]` bindings. Maps built in the component class and bound by reference (`[class]=\"classMap\"`) cannot be checked.",
};

/**
 * Angular drops a class map key that contains a space, but passes any other
 * key to `classList.add`, which throws on the remaining ASCII whitespace.
 * Other whitespace, such as a non-breaking space, is part of the class name.
 */
function getMessageId(key: string): MessageIds | null {
  if (key.includes(' ')) {
    return hasClassToken(key) ? 'spaceInKey' : null;
  }
  return /[\t\n\f\r]/.test(key) ? 'tabOrNewlineInKey' : null;
}

function hasClassToken(key: string): boolean {
  return /[^\t\n\f\r ]/.test(key);
}

/**
 * Returns the object literals that Angular would apply as the class map:
 * the expression itself, either branch of a ternary, or either side of
 * `&&` / `||` / `??`, looking through parentheses. Maps in value positions
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
    (ast.operation === '&&' || ast.operation === '||' || ast.operation === '??')
  ) {
    return [...collectClassMaps(ast.left), ...collectClassMaps(ast.right)];
  }

  return [];
}
