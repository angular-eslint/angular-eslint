import type { TmplAstElement } from '@angular/compiler';
import type { ARIARoleRelationConceptAttribute } from 'aria-query';
import { getAttributeValue } from './get-attribute-value';

export function attributesComparator(
  baseAttributes: readonly ARIARoleRelationConceptAttribute[],
  node: TmplAstElement,
): boolean {
  const attributes = [...node.attributes, ...node.inputs];

  return baseAttributes.every((baseAttribute) =>
    attributes.some(({ name }) => {
      if (node.name === 'a' && name === 'routerLink') {
        return true;
      }

      if (baseAttribute.name !== name) {
        return false;
      }

      return (
        !baseAttribute.value ||
        baseAttribute.value === getAttributeValue(node, baseAttribute.name)
      );
    }),
  );
}
