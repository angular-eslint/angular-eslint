import {
  type AST,
  ASTWithSource,
  Binary,
  Conditional,
  EmptyExpr,
  Interpolation,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  TemplateLiteral,
  TypeofExpression,
  Unary,
  VoidExpression,
} from '@angular-eslint/bundled-angular-compiler';

/**
 * Determines whether a template expression is a constant, i.e. its value is
 * fully determined by the template source alone and can never change at
 * runtime.
 *
 * An expression is constant when it is built exclusively from literals
 * (strings, numbers, booleans, `null`, `undefined`, literal maps, literal
 * arrays and template literals) combined with pure operators (arithmetic,
 * logical, comparison, conditional, `typeof`, `void`, `!`, `!!`, parentheses).
 *
 * Anything that reads component state (property reads, keyed reads), performs
 * a call, or applies a pipe is dynamic. Unknown node types are also treated as
 * dynamic, so that this helper fails open rather than reporting false
 * positives.
 */
export function isConstantExpression(node: AST): boolean {
  if (node instanceof ASTWithSource) {
    return isConstantExpression(node.ast);
  }

  if (node instanceof LiteralPrimitive || node instanceof EmptyExpr) {
    return true;
  }

  if (node instanceof LiteralMap) {
    return node.values.every(isConstantExpression);
  }

  if (node instanceof LiteralArray) {
    return node.expressions.every(isConstantExpression);
  }

  if (node instanceof Interpolation || node instanceof TemplateLiteral) {
    return node.expressions.every(isConstantExpression);
  }

  if (node instanceof ParenthesizedExpression) {
    return isConstantExpression(node.expression);
  }

  // `Unary` extends `Binary`, so it must be checked first.
  if (node instanceof Unary) {
    return isConstantExpression(node.expr);
  }

  if (node instanceof Binary) {
    return isConstantExpression(node.left) && isConstantExpression(node.right);
  }

  if (node instanceof Conditional) {
    return (
      isConstantExpression(node.condition) &&
      isConstantExpression(node.trueExp) &&
      isConstantExpression(node.falseExp)
    );
  }

  if (
    node instanceof PrefixNot ||
    node instanceof TypeofExpression ||
    node instanceof VoidExpression ||
    node instanceof NonNullAssert
  ) {
    return isConstantExpression(node.expression);
  }

  return false;
}
