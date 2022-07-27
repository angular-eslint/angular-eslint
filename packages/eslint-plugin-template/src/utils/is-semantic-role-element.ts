import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AXObjectRoles, elementAXObjects } = require('axobject-query');

export function isSemanticRoleElement(
  element: string,
  role: string,
  elementAttributes: (TmplAstTextAttribute | TmplAstBoundAttribute)[],
): boolean {
  // elementAXObjects: HTML elements are mapped to their related AXConcepts concepts
  return elementAXObjects.keys().some(
    (htmlElement: {
      name: string;
      attributes?: { name: string; value: string }[];
    }) =>
      htmlElement.name === element &&
      (htmlElement.attributes || []).every(
        (htmlElemAttr: { name: string; value: string }) =>
          // match given elementAttributes to htmlElement attributes
          elementAttributes.some(
            (elemAttr) =>
              htmlElemAttr.name === elemAttr.name &&
              htmlElemAttr.value === elemAttr.value,
          ),
      ) &&
      // aria- properties are covered by the element's semantic role
      elementAXObjects.get(htmlElement)?.some((roleName: unknown) =>
        // AXObjectRoles: AXObjects are mapped to their related ARIA concepts
        AXObjectRoles.get(roleName)?.some(
          (semanticRole: { name: string }) => semanticRole.name === role,
        ),
      ),
  );
}
