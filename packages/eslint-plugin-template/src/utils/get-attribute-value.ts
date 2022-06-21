import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
} from '@angular-eslint/bundled-angular-compiler';
import { PROPERTY_READ } from './constants';
import { getOriginalAttributeName } from './get-original-attribute-name';

/**
 * Extracts the attribute value.
 * @example
 * ```ts
 * getAttributeValue(Element(`<div property="test"></div>`), 'nonExistent'); // null
 * getAttributeValue(Element(`<div aria-role="none"></div>`), 'role'); // 'none'
 * getAttributeValue(Element(`<div [attr.aria-checked]="true"></div>`), 'aria-checked'); // true
 * getAttributeValue(Element(`<button [variant]="variant"></button>`), 'variant'); // PROPERTY
 * ```
 */
export function getAttributeValue(
  { attributes, inputs }: TmplAstElement,
  attributeName: string,
): unknown {
  const attributeOrInput = [...attributes, ...inputs].find(
    (attrOrInput) => getOriginalAttributeName(attrOrInput) === attributeName,
  );

  if (typeof attributeOrInput?.value === 'string') {
    return attributeOrInput.value;
  }

  if (!(attributeOrInput?.value instanceof ASTWithSource)) {
    return null;
  }

  if (attributeOrInput.value.ast instanceof LiteralArray) {
    return attributeOrInput.value.ast.expressions;
  }

  if (attributeOrInput.value.ast instanceof LiteralMap) {
    const { keys, values } = attributeOrInput.value.ast;
    return keys.reduce((current, next, index) => {
      return current.set(next.key, values[index]);
    }, new Map<string, unknown>());
  }

  if (attributeOrInput.value.ast instanceof LiteralPrimitive) {
    return attributeOrInput.value.ast.value;
  }

  return PROPERTY_READ;
}
