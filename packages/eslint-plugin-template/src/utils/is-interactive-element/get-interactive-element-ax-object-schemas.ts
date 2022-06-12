// This is a basic typing for schemas that are coming from the
// `axobject-query` package.
interface AXObjectSchema {
  name: string;
  attributes?: { name: string; value?: string }[];
}

let interactiveElementAXObjectSchemas: AXObjectSchema[] | null = null;

// This function follows the lazy initialization pattern.
// Since this is a top-level module (it will be included via `require`), we do not need to
// initialize the `interactiveElementAXObjectSchemas` until the function is called
// for the first time, so we will not take up the memory.
export function getInteractiveElementAXObjectSchemas(): AXObjectSchema[] {
  if (interactiveElementAXObjectSchemas === null) {
    // This package doesn't have type definitions.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AXObjects, elementAXObjects } = require('axobject-query');

    // This set will contain all possible roles in ARIA, which are
    // type of `structure` or `window` (since we filter out `widget` type).
    const interactiveAXObjects = new Set<string>(
      Array.from<string>(AXObjects.keys()).filter(
        (name) => AXObjects.get(name).type === 'widget',
      ),
    );

    // This will contain all schemas that are related to ARIA roles
    // listed in the above set `interactiveAXObjects`.
    interactiveElementAXObjectSchemas = [...elementAXObjects.entries()].reduce<
      AXObjectSchema[]
    >((accumulator, [elementSchema, AXObjectSet]) => {
      return accumulator.concat(
        [...AXObjectSet].every((role) => interactiveAXObjects.has(role))
          ? elementSchema
          : [],
      );
    }, []);
  }

  return interactiveElementAXObjectSchemas;
}
