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
  PrefixNot,
  PropertyRead,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
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
}

export function areEquivalentASTs(
  a: AST,
  b: AST,
  options: AreEquivalentASTsOptions = {},
): boolean {
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

  return false;
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
  return (
    options.templateLocals?.has(a.name) === true &&
    a.receiver instanceof ThisReceiver !== b.receiver instanceof ThisReceiver
  );
}

/**
 * Gets a cheap key for an AST that is always the same for two ASTs that
 * `areEquivalentASTs` considers equivalent. Two ASTs with the same key may
 * still not be equivalent, so the key is only useful for bucketing candidates
 * before running the full `areEquivalentASTs` check.
 *
 * The key must never be more specific than `areEquivalentASTs`. Unhandled
 * types fall back to the constructor name, which is always safe because
 * `areEquivalentASTs` only equates ASTs of the same type (apart from implicit
 * and explicit `this` receivers, which share a key below).
 */
export function getEquivalenceKey(ast: AST): string {
  if (ast instanceof ASTWithSource) {
    return getEquivalenceKey(ast.ast);
  }

  if (ast instanceof ImplicitReceiver || ast instanceof ThisReceiver) {
    return 'this';
  }

  if (ast instanceof PropertyRead || ast instanceof SafePropertyRead) {
    return `${getEquivalenceKey(ast.receiver)}.${ast.name}`;
  }

  if (ast instanceof Call || ast instanceof SafeCall) {
    return `${getEquivalenceKey(ast.receiver)}(${ast.args.length})`;
  }

  if (ast instanceof KeyedRead || ast instanceof SafeKeyedRead) {
    return `${getEquivalenceKey(ast.receiver)}[${getEquivalenceKey(ast.key)}]`;
  }

  if (ast instanceof LiteralPrimitive) {
    return `${typeof ast.value}:${String(ast.value)}`;
  }

  if (ast instanceof NonNullAssert) {
    return `${getEquivalenceKey(ast.expression)}!`;
  }

  if (ast instanceof BindingPipe) {
    return `${getEquivalenceKey(ast.exp)}|${ast.name}:${ast.args.length}`;
  }

  return ast.constructor.name;
}
