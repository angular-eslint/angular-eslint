import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getOriginalAttributeName } from './get-original-attribute-name';
import { getAttributeValue } from './get-attribute-value';

export function isDisabledElement(node: TmplAstElement): boolean {
  const attributesInputs = [...node.attributes, ...node.inputs];
  const disabledAttr = attributesInputs.find(
    (attr) => getOriginalAttributeName(attr) === 'disabled',
  );
  const disabledValue = getAttributeValue(node, 'disabled');
  const isHTML5Disabled = disabledAttr && disabledValue !== undefined;
  if (isHTML5Disabled) {
    return true;
  }

  const isAriaDisabled =
    String(getAttributeValue(node, 'aria-disabled')).toLowerCase() === 'true';
  if (isAriaDisabled) {
    return true;
  }

  return false;
}
