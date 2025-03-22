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
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  PrefixNot,
  PropertyRead,
  PropertyWrite,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TypeofExpression,
  Unary,
} from '@angular-eslint/bundled-angular-compiler';

export function areEquivalentASTs(a: AST, b: AST): boolean {
  // An `ImplicitReceiver` is equivalent to a `ThisReceiver` because
  // `this.foo` and `foo` mean the same thing. A `ThisReceiver` extends
  // `ImplicitReceiver` so before we check if the two ASTs are the same
  // type, we can check if they are both some sort of `ImplicitReceiver`.
  if (a instanceof ImplicitReceiver) {
    return b instanceof ImplicitReceiver;
  }

  // Bail out if the two ASTs are not the same type.
  if (a.constructor !== b.constructor) {
    return false;
  }

  // Check reads and calls first, because
  // they are probably the most common type.

  if (a instanceof PropertyRead && b instanceof PropertyRead) {
    return a.name === b.name && areEquivalentASTs(a.receiver, b.receiver);
  }

  if (a instanceof SafePropertyRead && b instanceof SafePropertyRead) {
    return a.name === b.name && areEquivalentASTs(a.receiver, b.receiver);
  }

  if (a instanceof Call && b instanceof Call) {
    return (
      areEquivalentASTArrays(a.args, b.args) &&
      areEquivalentASTs(a.receiver, b.receiver)
    );
  }

  if (a instanceof SafeCall && b instanceof SafeCall) {
    return (
      areEquivalentASTArrays(a.args, b.args) &&
      areEquivalentASTs(a.receiver, b.receiver)
    );
  }

  if (a instanceof KeyedRead && b instanceof KeyedRead) {
    return (
      areEquivalentASTs(a.key, b.key) &&
      areEquivalentASTs(a.receiver, b.receiver)
    );
  }

  if (a instanceof SafeKeyedRead && b instanceof SafeKeyedRead) {
    return (
      areEquivalentASTs(a.key, b.key) &&
      areEquivalentASTs(a.receiver, b.receiver)
    );
  }

  if (a instanceof NonNullAssert && b instanceof NonNullAssert) {
    return areEquivalentASTs(a.expression, b.expression);
  }

  // Expressions used as conditions can come next.

  if (a instanceof PrefixNot && b instanceof PrefixNot) {
    return areEquivalentASTs(a.expression, b.expression);
  }

  // Unary extends Binary, so we need to check `Unary`
  // first, otherwise we will treat it as a `Binary`.
  if (a instanceof Unary && b instanceof Unary) {
    return a.operator === b.operator && areEquivalentASTs(a.expr, b.expr);
  }

  if (a instanceof Binary && b instanceof Binary) {
    return (
      a.operation === b.operation &&
      areEquivalentASTs(a.left, b.left) &&
      areEquivalentASTs(a.right, b.right)
    );
  }

  if (a instanceof Conditional && b instanceof Conditional) {
    return (
      areEquivalentASTs(a.condition, b.condition) &&
      areEquivalentASTs(a.trueExp, b.trueExp) &&
      areEquivalentASTs(a.falseExp, b.falseExp)
    );
  }

  // Literals can be checked next.

  if (a instanceof LiteralPrimitive && b instanceof LiteralPrimitive) {
    return a.value === b.value;
  }

  if (a instanceof LiteralArray && b instanceof LiteralArray) {
    return areEquivalentASTArrays(a.expressions, b.expressions);
  }

  if (a instanceof LiteralMap && b instanceof LiteralMap) {
    return (
      a.keys.length === b.keys.length &&
      // Only check that the keys are equivalent. We don't need to check
      // the `quoted` property because a quoted key with the same value as
      // an unquoted key is the same key. Likewise, the `isShorthandInitialized`
      // property doesn't affect the name of the key.
      a.keys.every((aKey, index) => aKey.key === b.keys[index].key) &&
      areEquivalentASTArrays(a.values, b.values)
    );
  }

  // Pipes and interpolations are next.

  if (a instanceof BindingPipe && b instanceof BindingPipe) {
    return (
      a.name === b.name &&
      areEquivalentASTs(a.exp, b.exp) &&
      areEquivalentASTArrays(a.args, b.args)
    );
  }

  if (a instanceof Interpolation && b instanceof Interpolation) {
    return (
      a.strings.length === b.strings.length &&
      a.strings.every((aString, index) => aString === b.strings[index]) &&
      areEquivalentASTArrays(a.expressions, b.expressions)
    );
  }

  // Miscellaneous things and writes can be checked next.

  if (a instanceof ASTWithSource && b instanceof ASTWithSource) {
    return areEquivalentASTs(a.ast, b.ast);
  }

  if (a instanceof Chain && b instanceof Chain) {
    return areEquivalentASTArrays(a.expressions, b.expressions);
  }

  if (a instanceof PropertyWrite && b instanceof PropertyWrite) {
    return (
      a.name === b.name &&
      areEquivalentASTs(a.receiver, b.receiver) &&
      areEquivalentASTs(a.value, b.value)
    );
  }

  if (a instanceof KeyedWrite && b instanceof KeyedWrite) {
    return (
      areEquivalentASTs(a.key, b.key) &&
      areEquivalentASTs(a.receiver, b.receiver) &&
      areEquivalentASTs(a.value, b.value)
    );
  }

  if (a instanceof TypeofExpression && b instanceof TypeofExpression) {
    return areEquivalentASTs(a.expression, b.expression);
  }

  return false;
}

function areEquivalentASTArrays(a: AST[], b: AST[]): boolean {
  return (
    a.length === b.length &&
    a.every((aElement, index) => areEquivalentASTs(aElement, b[index]))
  );
}
