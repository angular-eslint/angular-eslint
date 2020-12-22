import { PROPERTY } from './constants';
import { getAttributeValue } from './get-attribute-value';

const presentationRoles = new Set(['presentation', 'none', PROPERTY]);

export function isPresentationRole(node: any): boolean {
  const attribute = getAttributeValue<string>(node, 'role');
  return attribute !== null && presentationRoles.has(attribute);
}
