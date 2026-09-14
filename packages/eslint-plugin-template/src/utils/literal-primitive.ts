import {
  AST,
  LiteralPrimitive,
  TemplateLiteral,
} from '@angular-eslint/bundled-angular-compiler';

export type Quote = "'" | '"' | '`';

export function isLiteralPrimitive(node: AST): node is LiteralPrimitive {
  // The template parser stamps `type` from `constructor.name`. `instanceof`
  // fails when more than one copy of `@angular-eslint/bundled-angular-compiler`
  // is installed (version mismatches, Yarn `hoistingLimits`, etc.).
  return (
    !!node &&
    ((node as { type?: string }).type === 'LiteralPrimitive' ||
      node instanceof LiteralPrimitive)
  );
}

export function isStringLiteralPrimitive(
  node: AST,
): node is Omit<LiteralPrimitive, 'value'> & { value: string } {
  return isLiteralPrimitive(node) && typeof node.value === 'string';
}

export function isTemplateLiteral(node: AST): node is TemplateLiteral {
  // See the note in `isLiteralPrimitive` about `instanceof`.
  return (
    !!node &&
    ((node as { type?: string }).type === 'TemplateLiteral' ||
      node instanceof TemplateLiteral)
  );
}

export function getLiteralPrimitiveStringValue(
  node: LiteralPrimitive,
  quote: Quote,
): string {
  return typeof node.value === 'string'
    ? `${node.value.replaceAll(quote, `\\${quote}`)}`
    : String(node.value);
}
