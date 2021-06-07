import type {
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';
import type { ARIARoleRelationConceptAttribute } from 'aria-query';
import { getAttributeValue } from './get-attribute-value';
import { getLiteralValue } from './get-literal-value';

export function attributesComparator(
  baseAttributes: readonly ARIARoleRelationConceptAttribute[] = [],
  node: TmplAstElement,
): boolean {
  const attributes: (TmplAstTextAttribute | TmplAstBoundAttribute)[] = [
    ...node.attributes,
    ...node.inputs,
  ];

  return baseAttributes.every((baseAttribute) =>
    attributes.some(
      (attribute: TmplAstTextAttribute | TmplAstBoundAttribute) => {
        if (node.name === 'a' && attribute.name === 'routerLink') {
          return true;
        }

        if (baseAttribute.name !== attribute.name) {
          return false;
        }

        return (
          !baseAttribute.value ||
          baseAttribute.value ===
            getLiteralValue(getAttributeValue(node, baseAttribute.name))
        );
      },
    ),
  );
}
