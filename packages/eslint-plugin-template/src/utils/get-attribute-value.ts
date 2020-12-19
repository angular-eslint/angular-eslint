import {
  ASTWithSource,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';

import { PROPERTY } from './constants';

export function getAttributeValue<T = string>(
  node: TmplAstElement,
  attributeName: string,
): T | null | typeof PROPERTY {
  const attribute = node.attributes.find(
    (attribute: TmplAstTextAttribute) => attribute.name === attributeName,
  );

  if (attribute) {
    return (attribute.value as unknown) as T;
  }

  const input = node.inputs.find(
    (input: TmplAstBoundAttribute) => input.name === attributeName,
  );

  if (!input || !(input.value instanceof ASTWithSource)) {
    return null;
  } else if (input.value.ast instanceof LiteralPrimitive) {
    return input.value.ast.value;
  } else {
    return PROPERTY;
  }
}

export function notAnAttribute(
  attribute: unknown,
): attribute is null | typeof PROPERTY {
  return attribute === null || attribute === PROPERTY;
}
