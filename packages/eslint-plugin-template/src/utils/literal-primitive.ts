import {
  AST,
  LiteralPrimitive,
} from '@angular-eslint/bundled-angular-compiler';

export function isLiteralPrimitive(node: AST): node is LiteralPrimitive {
  return node instanceof LiteralPrimitive;
}

export function isStringLiteralPrimitive(
  node: AST,
): node is Omit<LiteralPrimitive, 'value'> & { value: string } {
  return isLiteralPrimitive(node) && typeof node.value === 'string';
}

export function getLiteralPrimitiveStringValue(node: LiteralPrimitive, quote: "'" | '"' | '`'): string {
  return typeof node.value === 'string' ? `${node.value.replaceAll(quote, `\\${quote}`)}` : String(node.value);
}