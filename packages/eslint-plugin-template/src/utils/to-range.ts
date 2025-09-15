import { ParseSourceSpan } from '@angular-eslint/bundled-angular-compiler';

export function toRange(span: ParseSourceSpan): [number, number] {
  return [span.start.offset, span.end.offset];
}

export function toZeroLengthRange(offset: number): [number, number] {
  return [offset, offset];
}
