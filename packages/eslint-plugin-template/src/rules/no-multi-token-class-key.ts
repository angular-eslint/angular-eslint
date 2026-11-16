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
  TmplAstElement,
  TmplAstTemplate,
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
    // The inputs of an element with a structural directive are also the
    // inputs of its implicit `<ng-template>`, so the same node is visited twice.
    const checked = new Set<TmplAstBoundAttribute>();

    return {
      'BoundAttribute[name="class"]'(
        node: TmplAstBoundAttribute & { parent?: unknown },
      ) {
        // `[class]` and `bind-class` have the key span `class`, whereas
        // `[attr.class]` and `bind-attr.class` share the name `class` too.
        if (
          checked.has(node) ||
          !appliesStyling(node) ||
          node.keySpan?.toString() !== 'class' ||
          !(node.value instanceof ASTWithSource) ||
          !node.valueSpan
        ) {
          return;
        }
        checked.add(node);

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

        for (const { entries, keysKnown, keyCounts } of collectClassMaps(
          node.value.ast,
        )) {
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

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId,
              // A key made only of whitespace holds no class to split into.
              // A token that may also be another key of the same class map
              // would change which condition decides that class, and so
              // would splitting a key that the map repeats, since a later
              // entry may override it. A pipe in the condition would run
              // once per class after the split.
              suggest:
                offsetsMatchSource &&
                tokens.length > 0 &&
                keysKnown &&
                keyCounts.get(key.key) === 1 &&
                !tokens.some((token) => keyCounts.has(token)) &&
                !(tokens.length > 1 && containsPipe(value)) &&
                isSafeToWrite(
                  sourceText.slice(start, end),
                  tokens,
                  valueSource,
                  attributeQuote,
                )
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
    "Angular reads each key of an object bound to `[class]` (or `bind-class`) as a single class name and handles whitespace inside a key in one of two ways. A key that contains a space (for example `{ 'text-x dark:text-y': cond }`) is discarded by Angular's styling runtime without any build error or runtime warning, even in development mode, so the element gets none of its classes. A key that contains a tab or newline but no space is not filtered out: it reaches `classList.add`, which throws an `InvalidCharacterError` at runtime. This usually happens when a variant is appended to an existing key, or when migrating from `[ngClass]`, which does split keys on whitespace and is therefore not affected. Keys made only of spaces are dropped without losing any class, so they are not reported. This rule complements `prefer-class-binding`, which declines to suggest `[class]` for such keys but never inspects existing `[class]` bindings. Maps built in the component class and bound by reference (`[class]=\"classMap\"`) cannot be checked. Bindings on `<ng-template>` and `<ng-container>` are not reported, since Angular applies no classes there, but a component that declares its own `class` input cannot be recognized from the template and is still reported. The suggested fix splits the key into one key per distinct class, each with a copy of the condition, so the condition is then evaluated once per class and should be checked for side effects before applying it. The suggestion is not offered when another key of the same map, including keys spread into it, may name one of those classes, when the map repeats the key itself, when a spread adds keys that cannot be read from the template, when the condition contains a pipe, which would then run once per class, when the key contains an escape sequence, or when a class name holds a character that could change how the template is parsed, such as a quote, a backtick, `$`, `<`, or `&` followed by a letter, digit or `#`.",
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
 * Whether the split entries can be written in place of the original entry
 * without escaping anything. Escapes in the key are not reproduced, and each
 * class name is written back verbatim, so it is limited to characters that
 * mean nothing special to the expression lexer (quotes, backslashes), to a
 * template literal (backticks, `${`), or to the HTML around the attribute
 * value (character references, `{{` interpolation, tags). The rest of the
 * replacement is copied from source text that parsed as plain characters, as
 * long as no `{{` puts part of the value in interpolation mode.
 */
function isSafeToWrite(
  keySource: string,
  tokens: readonly string[],
  valueSource: string,
  attributeQuote: string | undefined,
): boolean {
  return (
    (attributeQuote === '"' || attributeQuote === "'") &&
    !keySource.includes('\\') &&
    !valueSource.includes('{{') &&
    tokens.every((token) => !/["'`$<\0]|&[A-Za-z0-9#]|\{\{|\}\}/.test(token))
  );
}

/**
 * Angular applies `[class]` to elements only. On `<ng-template>` and
 * `<ng-container>`, which render no element of their own, it is ignored.
 * The inputs of an element with a structural directive are shared with its
 * implicit template, so the parent may be either of them.
 */
function appliesStyling(
  node: TmplAstBoundAttribute & { parent?: unknown },
): boolean {
  const { parent } = node;
  const element =
    parent instanceof TmplAstTemplate
      ? parent.children.find(
          (child) =>
            child instanceof TmplAstElement && child.inputs.includes(node),
        )
      : parent;
  return (
    element instanceof TmplAstElement &&
    element.name.replace(/^:[^:]*:/, '') !== 'ng-container'
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
  /** How many entries of the map hold each property key */
  readonly keyCounts: ReadonlyMap<string, number>;
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

  const keyCounts = new Map<string, number>();
  for (const { map, index } of entries) {
    const key = map.keys[index];
    if (key.kind === 'property') {
      keyCounts.set(key.key, (keyCounts.get(key.key) ?? 0) + 1);
    }
  }

  return { entries, keysKnown, keyCounts };
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
