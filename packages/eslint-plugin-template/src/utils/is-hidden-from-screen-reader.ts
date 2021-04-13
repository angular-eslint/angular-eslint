import type { TmplAstElement } from '@angular/compiler';
import { PROPERTY } from './constants';
import { getAttributeValue } from './get-attribute-value';
import { getLiteralValue } from './get-literal-value';

/**
 * Whether an element has the `aria-hidden` property and its value is empty or
 * `true`. It also returns `true` if the element is an `input` with `type="hidden"`.
 */
export function isHiddenFromScreenReader(node: TmplAstElement): boolean {
  if (node.name.toUpperCase() === 'INPUT') {
    const typeAttributeValue = getAttributeValue(node, 'type');
    if (
      typeof typeAttributeValue === 'string' &&
      typeAttributeValue.toUpperCase() === 'HIDDEN'
    ) {
      return true;
    }
  }

  const ariaHidden = getLiteralValue(getAttributeValue(node, 'aria-hidden'));
  return ariaHidden === '' || ariaHidden === PROPERTY || ariaHidden === true;
}
