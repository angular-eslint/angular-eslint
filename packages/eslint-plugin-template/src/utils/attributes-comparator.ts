import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import type { ARIARoleRelationConceptAttribute } from 'aria-query';
import { getAttributeValue } from './get-attribute-value';

export function attributesComparator(
  ariaRoleRelationConceptAttributes: readonly ARIARoleRelationConceptAttribute[],
  node: TmplAstElement,
): boolean {
  const attributesInputs = [...node.attributes, ...node.inputs];

  return ariaRoleRelationConceptAttributes.every(
    (ariaRoleRelationConceptAttribute) =>
      attributesInputs.some(({ name }) => {
        if (node.name === 'a' && name === 'routerLink') {
          return true;
        }

        if (ariaRoleRelationConceptAttribute.name !== name) {
          return false;
        }

        return (
          !ariaRoleRelationConceptAttribute.value ||
          ariaRoleRelationConceptAttribute.value ===
            getAttributeValue(node, ariaRoleRelationConceptAttribute.name)
        );
      }),
  );
}
