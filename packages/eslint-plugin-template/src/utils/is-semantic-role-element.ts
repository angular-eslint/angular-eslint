import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';

// The axobject-query package doesn't have type definitions, but this is what we're using from it here
let axElements: Map<
  { name: string; attributes?: { name: string; value: string }[] },
  string[]
> | null = null;
let axRoles: Map<string, { name: string }[]> | null = null;

// This function follows the lazy initialization pattern.
// Since this is a top-level module (it will be included via `require`), we do not need to
// initialize the `nonInteractiveElementRoleSchemas` until the function is called
// for the first time, so we will not take up the memory.
export function isSemanticRoleElement(
  element: string,
  role: string,
  elementAttributes: (TmplAstTextAttribute | TmplAstBoundAttribute)[],
): boolean {
  if (axElements === null || axRoles === null) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AXObjectRoles, elementAXObjects } = require('axobject-query');
    axElements = elementAXObjects;
    axRoles = AXObjectRoles;
  }

  // elementAXObjects: HTML elements are mapped to their related AXConcepts concepts
  return Array.from(axElements?.keys() ?? []).some(
    (htmlElement) =>
      htmlElement.name === element &&
      (htmlElement.attributes ?? []).every((htmlElemAttr) =>
        // match every axElement html attributes to given elementAttributes
        elementAttributes.find(
          (elemAttr) =>
            htmlElemAttr.name === elemAttr.name &&
            htmlElemAttr.value === elemAttr.value,
        ),
      ) &&
      // aria- properties are covered by the element's semantic role
      axElements?.get(htmlElement)?.find((roleName: string) =>
        // AXObjectRoles: AXObjects are mapped to their related ARIA concepts
        axRoles
          ?.get(roleName)
          ?.find(
            (semanticRole: { name: string }) => semanticRole.name === role,
          ),
      ),
  );
}
