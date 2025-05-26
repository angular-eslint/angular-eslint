import {
  type AST,
  ParenthesizedExpression,
} from '@angular-eslint/bundled-angular-compiler';

export function unwrapParenthesizedExpression(node: AST): AST {
  return node instanceof ParenthesizedExpression ? node.expression : node;
}
