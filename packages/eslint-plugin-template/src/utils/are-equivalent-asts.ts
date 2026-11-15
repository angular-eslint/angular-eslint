import {
  AST,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TaggedTemplateLiteral,
  TemplateLiteral,
  ThisReceiver,
  TypeofExpression,
  Unary,
} from '@angular-eslint/bundled-angular-compiler';

export interface AreEquivalentASTsOptions {
  /**
   * Names of template locals (for example `@let` declarations, template
   * references, and `@for` or `let-` variables) that are in scope for both
   * expressions. Both expressions must be evaluated in the same scope.
   *
   * An implicit read of one of these names resolves to the template local,
   * so it is not equivalent to an explicit `this.name` read of the component.
   */
  readonly templateLocals?: ReadonlySet<string>;

  /**
   * Also treats these expressions as equivalent:
   *
   * - an expression and the same expression wrapped in parentheses (except
   *   parentheses around an optional chain, which change its meaning), and
   * - template literals and tagged template literals with the same text and
   *   equivalent expressions.
   *
   * This is off by default because callers that autofix code may rely on the
   * exact form of an expression, for example to know whether a read refers
   * to a particular binding.
   */
  readonly matchParenthesesAndTemplateLiterals?: boolean;
}

export function areEquivalentASTs(
  a: AST,
  b: AST,
  options: AreEquivalentASTsOptions = {},
): boolean {
  a = normalize(a, options);
  b = normalize(b, options);

  // An `ImplicitReceiver` is equivalent to a `ThisReceiver` because
  // `this.foo` and `foo` mean the same thing. In Angular v21.1.0+,
  // `ThisReceiver` is a separate class, so we check for both types.
  if (a instanceof ImplicitReceiver || a instanceof ThisReceiver) {
    return b instanceof ImplicitReceiver || b instanceof ThisReceiver;
  }

  // Bail out if the two ASTs are not the same type.
  if (a.constructor !== b.constructor) {
    return false;
  }

  // Check reads and calls first, because
  // they are probably the most common type.

  if (
    (a instanceof PropertyRead && b instanceof PropertyRead) ||
    (a instanceof SafePropertyRead && b instanceof SafePropertyRead)
  ) {
    return (
      a.name === b.name &&
      !isTemplateLocalComparedWithThis(a, b, options) &&
      areEquivalentASTs(a.receiver, b.receiver, options)
    );
  }

  if (a instanceof Call && b instanceof Call) {
    return (
      areEquivalentASTArrays(a.args, b.args, options) &&
      areEquivalentASTs(a.receiver, b.receiver, options)
    );
  }

  if (a instanceof SafeCall && b instanceof SafeCall) {
    return (
      areEquivalentASTArrays(a.args, b.args, options) &&
      areEquivalentASTs(a.receiver, b.receiver, options)
    );
  }

  if (a instanceof KeyedRead && b instanceof KeyedRead) {
    return (
      areEquivalentASTs(a.key, b.key, options) &&
      areEquivalentASTs(a.receiver, b.receiver, options)
    );
  }

  if (a instanceof SafeKeyedRead && b instanceof SafeKeyedRead) {
    return (
      areEquivalentASTs(a.key, b.key, options) &&
      areEquivalentASTs(a.receiver, b.receiver, options)
    );
  }

  if (a instanceof NonNullAssert && b instanceof NonNullAssert) {
    return areEquivalentASTs(a.expression, b.expression, options);
  }

  // Expressions used as conditions can come next.

  if (a instanceof PrefixNot && b instanceof PrefixNot) {
    return areEquivalentASTs(a.expression, b.expression, options);
  }

  // Unary extends Binary, so we need to check `Unary`
  // first, otherwise we will treat it as a `Binary`.
  if (a instanceof Unary && b instanceof Unary) {
    return (
      a.operator === b.operator && areEquivalentASTs(a.expr, b.expr, options)
    );
  }

  if (a instanceof Binary && b instanceof Binary) {
    return (
      a.operation === b.operation &&
      areEquivalentASTs(a.left, b.left, options) &&
      areEquivalentASTs(a.right, b.right, options)
    );
  }

  if (a instanceof Conditional && b instanceof Conditional) {
    return (
      areEquivalentASTs(a.condition, b.condition, options) &&
      areEquivalentASTs(a.trueExp, b.trueExp, options) &&
      areEquivalentASTs(a.falseExp, b.falseExp, options)
    );
  }

  // Literals can be checked next.

  if (a instanceof LiteralPrimitive && b instanceof LiteralPrimitive) {
    return a.value === b.value;
  }

  if (a instanceof LiteralArray && b instanceof LiteralArray) {
    return areEquivalentASTArrays(a.expressions, b.expressions, options);
  }

  if (a instanceof LiteralMap && b instanceof LiteralMap) {
    return (
      a.keys.length === b.keys.length &&
      // Only check that the keys are equivalent. We don't need to check
      // the `quoted` property because a quoted key with the same value as
      // an unquoted key is the same key. Likewise, the `isShorthandInitialized`
      // property doesn't affect the name of the key.
      a.keys.every((aKey, index) => {
        const bKey = b.keys[index];
        // Handle spread keys - they match if both are spread keys
        if (aKey.kind === 'spread' && bKey.kind === 'spread') {
          return true;
        }
        // If one is spread and the other isn't, they don't match
        if (aKey.kind !== bKey.kind) {
          return false;
        }
        // Both are property keys, compare the key values
        return (
          aKey.kind === 'property' &&
          bKey.kind === 'property' &&
          aKey.key === bKey.key
        );
      }) &&
      areEquivalentASTArrays(a.values, b.values, options)
    );
  }

  // Pipes and interpolations are next.

  if (a instanceof BindingPipe && b instanceof BindingPipe) {
    return (
      a.name === b.name &&
      areEquivalentASTs(a.exp, b.exp, options) &&
      areEquivalentASTArrays(a.args, b.args, options)
    );
  }

  if (a instanceof Interpolation && b instanceof Interpolation) {
    return (
      a.strings.length === b.strings.length &&
      a.strings.every((aString, index) => aString === b.strings[index]) &&
      areEquivalentASTArrays(a.expressions, b.expressions, options)
    );
  }

  // Miscellaneous things and writes can be checked next.

  if (a instanceof ASTWithSource && b instanceof ASTWithSource) {
    return areEquivalentASTs(a.ast, b.ast, options);
  }

  if (a instanceof Chain && b instanceof Chain) {
    return areEquivalentASTArrays(a.expressions, b.expressions, options);
  }

  if (a instanceof TypeofExpression && b instanceof TypeofExpression) {
    return areEquivalentASTs(a.expression, b.expression, options);
  }

  if (options.matchParenthesesAndTemplateLiterals) {
    // Parentheses that `unwrapTransparentParentheses` keeps (around optional
    // chains) are only equivalent to other parentheses around the same thing.
    if (
      a instanceof ParenthesizedExpression &&
      b instanceof ParenthesizedExpression
    ) {
      return areEquivalentASTs(a.expression, b.expression, options);
    }

    if (a instanceof TemplateLiteral && b instanceof TemplateLiteral) {
      return areEquivalentTemplateLiterals(a, b, options);
    }

    if (
      a instanceof TaggedTemplateLiteral &&
      b instanceof TaggedTemplateLiteral
    ) {
      return (
        areEquivalentASTs(a.tag, b.tag, options) &&
        areEquivalentTemplateLiterals(a.template, b.template, options)
      );
    }
  }

  return false;
}

function areEquivalentTemplateLiterals(
  a: TemplateLiteral,
  b: TemplateLiteral,
  options: AreEquivalentASTsOptions,
): boolean {
  return (
    a.elements.length === b.elements.length &&
    a.elements.every(
      (aElement, index) => aElement.text === b.elements[index].text,
    ) &&
    areEquivalentASTArrays(a.expressions, b.expressions, options)
  );
}

/**
 * Removes transparent parentheses when the options allow it.
 */
function normalize(ast: AST, options: AreEquivalentASTsOptions): AST {
  return options.matchParenthesesAndTemplateLiterals
    ? unwrapTransparentParentheses(ast)
    : ast;
}

/**
 * Removes parentheses that cannot change the meaning of the expression they
 * wrap. The parsed AST already encodes operator precedence, so `(a)` and `a`
 * evaluate the same way, with one exception: parentheses end an optional
 * chain, so `(a?.b).c` still reads `c` when `a` is nullish, whereas `a?.b.c`
 * short-circuits. To stay conservative, parentheses around an optional chain
 * are kept, so they only match other parentheses around the same chain.
 */
function unwrapTransparentParentheses(ast: AST): AST {
  let innermostParentheses: ParenthesizedExpression | undefined;
  while (ast instanceof ParenthesizedExpression) {
    innermostParentheses = ast;
    ast = ast.expression;
  }
  return innermostParentheses && isOptionalChain(ast)
    ? innermostParentheses
    : ast;
}

/**
 * Checks whether an expression is an optional chain, i.e. a chain of reads
 * and calls that contains a safe (`?.`) access that parentheses would stop
 * from short-circuiting the rest of the chain.
 */
function isOptionalChain(ast: AST): boolean {
  while (true) {
    if (
      ast instanceof SafePropertyRead ||
      ast instanceof SafeKeyedRead ||
      ast instanceof SafeCall
    ) {
      return true;
    }
    if (
      ast instanceof PropertyRead ||
      ast instanceof KeyedRead ||
      ast instanceof Call
    ) {
      ast = ast.receiver;
    } else if (ast instanceof NonNullAssert) {
      ast = ast.expression;
    } else {
      return false;
    }
  }
}

function areEquivalentASTArrays(
  a: AST[],
  b: AST[],
  options: AreEquivalentASTsOptions,
): boolean {
  return (
    a.length === b.length &&
    a.every((aElement, index) => areEquivalentASTs(aElement, b[index], options))
  );
}

/**
 * Checks whether one read is implicit (`name`) and the other is explicit
 * (`this.name`) while `name` is a template local. The implicit read then
 * resolves to the template local rather than the component member.
 */
function isTemplateLocalComparedWithThis(
  a: PropertyRead | SafePropertyRead,
  b: PropertyRead | SafePropertyRead,
  options: AreEquivalentASTsOptions,
): boolean {
  // Normalise the receivers in the same way that comparing them does, so
  // that `(this).name` counts as an explicit read just like `this.name`.
  return (
    options.templateLocals?.has(a.name) === true &&
    normalize(a.receiver, options) instanceof ThisReceiver !==
      normalize(b.receiver, options) instanceof ThisReceiver
  );
}

/**
 * Gets a cheap key for an AST that is always the same for two ASTs that
 * `areEquivalentASTs` considers equivalent with the same options. Two ASTs
 * with the same key may still not be equivalent, so the key is only useful
 * for bucketing candidates before running the full `areEquivalentASTs` check.
 *
 * The key must never be more specific than `areEquivalentASTs`: it may only
 * include information that `areEquivalentASTs` requires to be equal. In
 * particular, implicit and explicit `this` receivers share a key (even
 * though a template local can make `x` and `this.x` different), and
 * parentheses are unwrapped when, and only when, `areEquivalentASTs` unwraps
 * them. Unhandled types fall back to the constructor name, which is always
 * safe because `areEquivalentASTs` only equates ASTs of the same type.
 */
export function getEquivalenceKey(
  ast: AST,
  options: AreEquivalentASTsOptions = {},
): string {
  const key = (child: AST): string => getEquivalenceKey(child, options);
  const keys = (children: readonly AST[]): string =>
    children.map(key).join(',');

  ast = normalize(ast, options);

  if (ast instanceof ImplicitReceiver || ast instanceof ThisReceiver) {
    return 'this';
  }

  if (ast instanceof PropertyRead || ast instanceof SafePropertyRead) {
    return `${key(ast.receiver)}.${ast.name}`;
  }

  if (ast instanceof Call || ast instanceof SafeCall) {
    return `${key(ast.receiver)}(${keys(ast.args)})`;
  }

  if (ast instanceof KeyedRead || ast instanceof SafeKeyedRead) {
    return `${key(ast.receiver)}[${key(ast.key)}]`;
  }

  if (ast instanceof LiteralPrimitive) {
    return `${typeof ast.value}:${String(ast.value)}`;
  }

  if (ast instanceof NonNullAssert) {
    return `${key(ast.expression)}!`;
  }

  if (ast instanceof PrefixNot) {
    return `!${key(ast.expression)}`;
  }

  // `Unary` extends `Binary`, so it must be checked first.
  if (ast instanceof Unary) {
    return `${ast.operator}u(${key(ast.expr)})`;
  }

  if (ast instanceof Binary) {
    return `(${key(ast.left)}${ast.operation}${key(ast.right)})`;
  }

  if (ast instanceof Conditional) {
    return `(${key(ast.condition)}?${key(ast.trueExp)}:${key(ast.falseExp)})`;
  }

  if (ast instanceof LiteralArray) {
    return `[${keys(ast.expressions)}]`;
  }

  if (ast instanceof LiteralMap) {
    // Like `areEquivalentASTs`, ignore whether a property key is quoted.
    const mapKeys = ast.keys.map((mapKey) =>
      mapKey.kind === 'spread' ? '...' : JSON.stringify(mapKey.key),
    );
    return `{${mapKeys.join(',')}:${keys(ast.values)}}`;
  }

  if (ast instanceof BindingPipe) {
    return `${key(ast.exp)}|${ast.name}(${keys(ast.args)})`;
  }

  if (ast instanceof TypeofExpression) {
    return `typeof(${key(ast.expression)})`;
  }

  if (options.matchParenthesesAndTemplateLiterals) {
    if (ast instanceof ParenthesizedExpression) {
      return `(${key(ast.expression)})`;
    }

    if (ast instanceof TemplateLiteral) {
      return getTemplateLiteralKey(ast, keys);
    }

    if (ast instanceof TaggedTemplateLiteral) {
      return `${key(ast.tag)}${getTemplateLiteralKey(ast.template, keys)}`;
    }
  }

  return ast.constructor.name;
}

function getTemplateLiteralKey(
  ast: TemplateLiteral,
  keys: (asts: readonly AST[]) => string,
): string {
  const texts = ast.elements.map((element) => element.text).join('|');
  return `\`${texts}(${keys(ast.expressions)})\``;
}
