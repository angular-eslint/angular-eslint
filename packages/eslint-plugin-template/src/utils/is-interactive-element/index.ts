import { TmplAstElement } from '@angular/compiler';

import { getDomElements } from '../get-dom-elements';
import { attributesComparator } from '../attributes-comparator';
import { getInteractiveElementRoleSchemas } from './get-interactive-element-role-schemas';
import { getNonInteractiveElementRoleSchemas } from './get-non-interactive-element-role-schemas';
import { getInteractiveElementAXObjectSchemas } from './get-interactive-element-ax-object-schemas';

function checkIsInteractiveElement(node: TmplAstElement): boolean {
  function elementSchemaMatcher(elementSchema: any) {
    return (
      node.name === elementSchema.name &&
      attributesComparator(elementSchema.attributes, node)
    );
  }
  // Check in elementRoles for inherent interactive role associations for
  // this element.
  const isInherentInteractiveElement = getInteractiveElementRoleSchemas().some(
    elementSchemaMatcher,
  );
  if (isInherentInteractiveElement) {
    return true;
  }
  // Check in elementRoles for inherent non-interactive role associations for
  // this element.
  const isInherentNonInteractiveElement = getNonInteractiveElementRoleSchemas().some(
    elementSchemaMatcher,
  );
  if (isInherentNonInteractiveElement) {
    return false;
  }
  // Check in elementAXObjects for AX Tree associations for this element.
  const isInteractiveAXElement = getInteractiveElementAXObjectSchemas().some(
    elementSchemaMatcher,
  );
  if (isInteractiveAXElement) {
    return true;
  }

  return false;
}

/**
 * Returns boolean indicating whether the given element is
 * interactive on the DOM or not. Usually used when an element
 * has a dynamic handler on it and we need to discern whether or not
 * it's intention is to be interacted with on the DOM.
 */
export function isInteractiveElement(node: TmplAstElement): boolean {
  return getDomElements().has(node.name) && checkIsInteractiveElement(node);
}
