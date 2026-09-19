import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getAttributeValue } from './get-attribute-value';

const presentationRoles: ReadonlySet<string> = new Set([
  'none',
  'presentation',
]);

export function isPresentationRole(node: TmplAstElement): boolean {
  const roleAttributeValue = getAttributeValue(node, 'role');
  return (
    typeof roleAttributeValue === 'string' &&
    presentationRoles.has(roleAttributeValue)
  );
}
