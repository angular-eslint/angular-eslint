import type { TmplAstElement } from '@angular/compiler';
import {
  ASTWithSource,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
} from '@angular/compiler';
import { PROPERTY_READ } from './constants';
import { getOriginalAttributeName } from './get-original-attribute-name';

// The generic type `T` extends plain types because literal primitives
// can contain values that are of plain types. E.g. this is a literal primitive:
// <input [disabled]="false">
//        ~~~~~~~~~~~~~~~~~~
// And this is not:
// <input [disabled]="disabled">
//        ~~~~~~~~~~~~~~~~~~~~~
export function getAttributeValue(
  { attributes, inputs }: TmplAstElement,
  attributeName: string,
): unknown {
  const attribute = attributes.find(
    (attribute) => getOriginalAttributeName(attribute) === attributeName,
  );

  if (attribute) {
    return attribute.value;
  }

  const input = inputs.find(
    (input) => getOriginalAttributeName(input) === attributeName,
  );

  if (!(input?.value instanceof ASTWithSource)) {
    return null;
  } else if (input.value.ast instanceof LiteralArray) {
    return input.value.ast.expressions;
  } else if (input.value.ast instanceof LiteralMap) {
    const { keys, values } = input.value.ast;
    return keys.reduce((current, next, index) => {
      return current.set(next.key, values[index]);
    }, new Map<string, unknown>());
  } else if (input.value.ast instanceof LiteralPrimitive) {
    return input.value.ast.value;
  }

  return PROPERTY_READ;
}
