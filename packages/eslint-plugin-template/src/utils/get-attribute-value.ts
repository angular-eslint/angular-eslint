import type {
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';
import { ASTWithSource, LiteralPrimitive } from '@angular/compiler';
import { PROPERTY } from './constants';

// The generic type `T` extends plain types because literal primitives
// can contain values that are of plain types. E.g. this is a literal primitive:
// <input [disabled]="false">
//        ~~~~~~~~~~~~~~~~~~
// And this is not:
// <input [disabled]="disabled">
//        ~~~~~~~~~~~~~~~~~~~~~
export function getAttributeValue<T extends string | number | boolean = string>(
  node: TmplAstElement,
  attributeName: string,
): T | string | null | typeof PROPERTY {
  const attribute = node.attributes.find(
    (attribute: TmplAstTextAttribute) => attribute.name === attributeName,
  );

  if (attribute) {
    return attribute.value;
  }

  const input = node.inputs.find(
    (input: TmplAstBoundAttribute) => input.name === attributeName,
  );

  if (!input || !(input.value instanceof ASTWithSource)) {
    return null;
  } else if (input.value.ast instanceof LiteralPrimitive) {
    return input.value.ast.value;
  } else {
    // This means that an AST contains a property read, e.g.
    // `<input [disabled]="disabled">`.
    return PROPERTY;
  }
}

export function notAnAttributeOrIsProperty(
  attribute: unknown,
): attribute is null | typeof PROPERTY {
  return attribute === null || attribute === PROPERTY;
}
