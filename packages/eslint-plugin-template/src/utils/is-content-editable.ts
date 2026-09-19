import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getOriginalAttributeName } from './get-original-attribute-name';
import { getAttributeValue } from './get-attribute-value';

export function isContentEditable(node: TmplAstElement): boolean {
  const attributesInputs = [...node.attributes, ...node.inputs];
  const contentEditableAttr = attributesInputs.find(
    (attr) => getOriginalAttributeName(attr) === 'contenteditable',
  );
  const contentEditableValue = getAttributeValue(node, 'contenteditable');
  return (
    !!contentEditableAttr &&
    (contentEditableValue === '' ||
      String(contentEditableValue).toLowerCase() === 'true')
  );
}
