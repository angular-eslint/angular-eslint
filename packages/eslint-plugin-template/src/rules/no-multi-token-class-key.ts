import type {
  AST,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  Binary,
  Conditional,
  LiteralMap,
  NonNullAssert,
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
          !(node.value instanceof ASTWithSource) ||
          !node.valueSpan
        ) {
          return;
        }

        // Expression offsets index the decoded attribute value. When the
        // source holds HTML entities (such as `&amp;&amp;`), they no longer
        // match the template text, so report on the whole value and offer
        // no suggestion rather than rewrite the wrong characters.
        const { valueSpan } = node;
        const offsetsMatchSource =
          sourceText.slice(valueSpan.fullStart.offset, valueSpan.end.offset) ===
          node.value.source;

        for (const group of collectClassMaps(node.value.ast)) {
          for (const entry of group) {
            const { map, index } = entry;
            const key = map.keys[index];
            if (key.kind !== 'property') {
              continue;
            }

            const messageId = getMessageId(key.key);
            if (!messageId) {
              continue;
            }

            const [start, end] = offsetsMatchSource
              ? [key.sourceSpan.start, key.sourceSpan.end]
              : [valueSpan.start.offset, valueSpan.end.offset];
            const value = map.values[index];
            const tokens = getClassTokens(key.key);

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId,
              // A key made only of whitespace holds no class to split into,
              // and a token that is also another key of the same class map
              // would change which condition decides that class.
              suggest:
                offsetsMatchSource &&
                tokens.length > 0 &&
                !collidesWithOtherKey(tokens, group, entry)
                  ? [
                      {
                        messageId: 'splitKey',
                        fix: (fixer) =>
                          fixer.replaceTextRange(
                            [start, value.sourceSpan.end],
                            splitMultiTokenKey(
                              tokens,
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
          }
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
    return getClassTokens(key).length > 0 ? 'spaceInKey' : null;
  }
  return /[\t\n\f\r]/.test(key) ? 'tabOrNewlineInKey' : null;
}

function getClassTokens(key: string): string[] {
  return key.split(/[\t\n\f\r ]+/).filter(Boolean);
}

/**
 * An entry of a class map, addressed by its map and index so that the key
 * and its value stay paired.
 */
interface ClassMapEntry {
  readonly map: LiteralMap;
  readonly index: number;
}

function collidesWithOtherKey(
  tokens: readonly string[],
  group: readonly ClassMapEntry[],
  entry: ClassMapEntry,
): boolean {
  return group.some((other) => {
    const key = other.map.keys[other.index];
    return (
      other !== entry && key.kind === 'property' && tokens.includes(key.key)
    );
  });
}

/**
 * Returns the object literals that Angular would apply as the class map:
 * the expression itself, either branch of a ternary, or either side of
 * `&&` / `||` / `??`, looking through parentheses and non-null assertions.
 * Each class map is returned as one group of entries that also holds the
 * entries of object literals spread inline into it, since those become keys
 * of the same map. Maps in value positions (function arguments, object
 * values) are not class maps.
 */
function collectClassMaps(ast: AST): ClassMapEntry[][] {
  const groups: ClassMapEntry[][] = [];
  const pending: AST[] = [ast];

  while (pending.length > 0) {
    const current = unwrap(pending.pop()!);

    if (current instanceof LiteralMap) {
      groups.push(collectEntries(current));
    } else if (current instanceof Conditional) {
      pending.push(current.falseExp, current.trueExp);
    } else if (
      current instanceof Binary &&
      (current.operation === '&&' ||
        current.operation === '||' ||
        current.operation === '??')
    ) {
      pending.push(current.right, current.left);
    }
  }

  return groups;
}

function collectEntries(root: LiteralMap): ClassMapEntry[] {
  const entries: ClassMapEntry[] = [];
  const pending: LiteralMap[] = [root];

  while (pending.length > 0) {
    const map = pending.pop()!;
    map.keys.forEach((key, index) => {
      entries.push({ map, index });
      if (key.kind === 'spread') {
        const spread = unwrap(map.values[index]);
        if (spread instanceof LiteralMap) {
          pending.push(spread);
        }
      }
    });
  }

  return entries;
}

function unwrap(ast: AST): AST {
  while (
    ast instanceof ParenthesizedExpression ||
    ast instanceof NonNullAssert
  ) {
    ast = ast.expression;
  }
  return ast;
}
