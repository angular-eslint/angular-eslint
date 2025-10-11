import {
  AST,
  LiteralPrimitive,
  PropertyRead,
} from '@angular-eslint/bundled-angular-compiler';

export function isLengthRead(node: AST): node is PropertyRead {
  return node instanceof PropertyRead && node.name === 'length';
}

export function isZero(node: AST): boolean {
  return node instanceof LiteralPrimitive && node.value === 0;
}
