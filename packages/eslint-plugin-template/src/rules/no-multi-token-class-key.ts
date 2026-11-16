import type {
  AST,
  BindingPipe,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  Binary,
  Conditional,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  RecursiveAstVisitor,
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
        const valueSource = node.value.source ?? '';
        const offsetsMatchSource =
          sourceText.slice(valueSpan.fullStart.offset, valueSpan.end.offset) ===
          valueSource;
        const attributeQuote = sourceText[valueSpan.fullStart.offset - 1];

        for (const { entries, keysKnown } of collectClassMaps(node.value.ast)) {
          for (const entry of entries) {
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
            const tokens = [...new Set(getClassTokens(key.key))];
            const replacement = splitMultiTokenKey(
              tokens,
              key.quoted ? sourceText[start] : null,
              sourceText.slice(value.sourceSpan.start, value.sourceSpan.end),
            );

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId,
              // A key made only of whitespace holds no class to split into.
              // A token that may also be another key of the same class map
              // would change which condition decides that class. A pipe in
              // the condition would run once per class after the split.
              suggest:
                offsetsMatchSource &&
                tokens.length > 0 &&
                keysKnown &&
                !collidesWithOtherKey(tokens, entries, entry) &&
                !(tokens.length > 1 && containsPipe(value)) &&
                isSafeInAttribute(replacement, valueSource, attributeQuote)
                  ? [
                      {
                        messageId: 'splitKey',
                        fix: (fixer) =>
                          fixer.replaceTextRange(
                            [start, value.sourceSpan.end],
                            replacement,
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
    "Angular reads each key of an object bound to `[class]` (or `bind-class`) as a single class name and handles whitespace inside a key in one of two ways. A key that contains a space (for example `{ 'text-x dark:text-y': cond }`) is discarded by Angular's styling runtime without any build error or runtime warning, even in development mode, so the element gets none of its classes. A key that contains a tab or newline but no space is not filtered out: it reaches `classList.add`, which throws an `InvalidCharacterError` at runtime. This usually happens when a variant is appended to an existing key, or when migrating from `[ngClass]`, which does split keys on whitespace and is therefore not affected. Keys made only of spaces are dropped without losing any class, so they are not reported. This rule complements `prefer-class-binding`, which declines to suggest `[class]` for such keys but never inspects existing `[class]` bindings. Maps built in the component class and bound by reference (`[class]=\"classMap\"`) cannot be checked. The suggested fix splits the key into one key per distinct class, each with a copy of the condition. It is not offered when another key of the same map, including keys spread into it, may name one of those classes, when a spread adds keys that cannot be read from the template, when the condition contains a pipe, which would then run once per class, or when a class name could not be written back into the attribute without changing how the HTML is parsed.",
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
 * Whether the split entries can replace the original entry inside the
 * attribute value without changing how the HTML around them is parsed. The
 * tokens are decoded from the key, so an escape such as `\u0022` or
 * `\u0026` comes back as a raw character. The rest of the replacement is
 * copied from source text that parsed as plain characters, as long as no
 * `{{` puts part of the value in interpolation mode.
 */
function isSafeInAttribute(
  replacement: string,
  valueSource: string,
  attributeQuote: string | undefined,
): boolean {
  return (
    (attributeQuote === '"' || attributeQuote === "'") &&
    !replacement.includes(attributeQuote) &&
    // Character references, which the HTML parser decodes (or rejects)
    !/&(?:#|[A-Za-z]*;)/.test(replacement) &&
    !valueSource.includes('{{') &&
    !replacement.includes('{{') &&
    // The expression lexer reads U+0000 as the end of its input
    !replacement.includes('\0')
  );
}

class PipeFinder extends RecursiveAstVisitor {
  found = false;

  override visitPipe(_ast: BindingPipe, _context: unknown): void {
    this.found = true;
  }
}

function containsPipe(ast: AST): boolean {
  const finder = new PipeFinder();
  ast.visit(finder);
  return finder.found;
}

/**
 * An entry of a class map, addressed by its map and index so that the key
 * and its value stay paired.
 */
interface ClassMapEntry {
  readonly map: LiteralMap;
  readonly index: number;
}

/**
 * The entries of one class map, including those of object literals that may
 * be spread into it, and whether every key the map may hold is among them.
 */
interface ClassMap {
  readonly entries: readonly ClassMapEntry[];
  readonly keysKnown: boolean;
}

function collidesWithOtherKey(
  tokens: readonly string[],
  entries: readonly ClassMapEntry[],
  entry: ClassMapEntry,
): boolean {
  return entries.some((other) => {
    const key = other.map.keys[other.index];
    return (
      other !== entry && key.kind === 'property' && tokens.includes(key.key)
    );
  });
}

/**
 * Returns the object literals that Angular may apply as the class map, with
 * the entries of object literals that may be spread into each of them.
 */
function collectClassMaps(ast: AST): ClassMap[] {
  const roots: LiteralMap[] = [];
  collectPossibleMaps(ast, roots);
  return roots.map(collectEntries);
}

function collectEntries(root: LiteralMap): ClassMap {
  const entries: ClassMapEntry[] = [];
  const pending: LiteralMap[] = [root];
  let keysKnown = true;

  while (pending.length > 0) {
    const map = pending.pop()!;
    map.keys.forEach((key, index) => {
      entries.push({ map, index });
      if (
        key.kind === 'spread' &&
        !collectPossibleMaps(map.values[index], pending)
      ) {
        keysKnown = false;
      }
    });
  }

  return { entries, keysKnown };
}

/**
 * Adds to `maps` every object literal that `ast` may evaluate to: the
 * expression itself, either branch of a ternary, the right side of `&&`, or
 * either side of `||` / `??`, looking through parentheses and non-null
 * assertions. The left side of `&&` is only the result when it is falsy, and
 * no falsy value holds keys. Maps in value positions (function arguments,
 * object values) are not collected. Returns whether every value that `ast`
 * may evaluate to is either a collected map or a primitive without keys.
 */
function collectPossibleMaps(ast: AST, maps: LiteralMap[]): boolean {
  const current = unwrap(ast);

  if (current instanceof LiteralMap) {
    maps.push(current);
    return true;
  }
  if (current instanceof Conditional) {
    const trueKnown = collectPossibleMaps(current.trueExp, maps);
    const falseKnown = collectPossibleMaps(current.falseExp, maps);
    return trueKnown && falseKnown;
  }
  if (current instanceof Binary) {
    if (current.operation === '&&') {
      return collectPossibleMaps(current.right, maps);
    }
    if (current.operation === '||' || current.operation === '??') {
      const leftKnown = collectPossibleMaps(current.left, maps);
      const rightKnown = collectPossibleMaps(current.right, maps);
      return leftKnown && rightKnown;
    }
  }
  // Spreading a string adds a key per character
  return (
    current instanceof LiteralPrimitive &&
    (typeof current.value !== 'string' || current.value === '')
  );
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
