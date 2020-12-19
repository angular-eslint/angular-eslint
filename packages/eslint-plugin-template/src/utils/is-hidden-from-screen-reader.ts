import { PROPERTY } from './constants';
import { getLiteralValue } from './get-literal-value';
import { getAttributeValue } from './get-attribute-value';

/**
 * Returns boolean indicating that the aria-hidden prop
 * is present or the value is true. Will also return true if
 * there is an input with type='hidden'.
 *
 * <div aria-hidden /> is equivalent to the DOM as <div aria-hidden=true />.
 */
export function isHiddenFromScreenReader(node: any): boolean {
  if (node.name.toUpperCase() === 'INPUT') {
    const hidden = getAttributeValue(node, 'type');
    if (typeof hidden === 'string' && hidden.toUpperCase() === 'HIDDEN') {
      return true;
    }
  }

  const ariaHidden = getLiteralValue(getAttributeValue(node, 'aria-hidden'));
  return ariaHidden === PROPERTY || ariaHidden === true;
}
