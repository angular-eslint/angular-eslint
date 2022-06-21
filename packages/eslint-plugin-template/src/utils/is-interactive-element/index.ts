import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import type { ARIARoleRelationConcept } from 'aria-query';
import { attributesComparator } from '../attributes-comparator';
import { getDomElements } from '../get-dom-elements';
import { getInteractiveElementAXObjectSchemas } from './get-interactive-element-ax-object-schemas';
import { getInteractiveElementRoleSchemas } from './get-interactive-element-role-schemas';
import { getNonInteractiveElementRoleSchemas } from './get-non-interactive-element-role-schemas';

function checkIsInteractiveElement(node: TmplAstElement): boolean {
  function elementSchemaMatcher({ attributes, name }: ARIARoleRelationConcept) {
    return node.name === name && attributesComparator(attributes ?? [], node);
  }
  // Check in elementRoles for inherent interactive role associations for
  // this element.
  const isInherentInteractiveElement =
    getInteractiveElementRoleSchemas().some(elementSchemaMatcher);
  if (isInherentInteractiveElement) {
    return true;
  }
  // Check in elementRoles for inherent non-interactive role associations for
  // this element.
  const isInherentNonInteractiveElement =
    getNonInteractiveElementRoleSchemas().some(elementSchemaMatcher);
  if (isInherentNonInteractiveElement) {
    return false;
  }
  // Check in elementAXObjects for AX Tree associations for this element.
  return getInteractiveElementAXObjectSchemas().some(elementSchemaMatcher);
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
