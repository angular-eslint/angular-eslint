import * as ariaQuery from 'aria-query';
import type { ARIARoleDefintionKey, ARIARoleRelationConcept } from 'aria-query';

let nonInteractiveElementRoleSchemas: ARIARoleRelationConcept[] | null = null;

// This function follows the lazy initialization pattern.
// Since this is a top-level module (it will be included via `require`), we do not need to
// initialize the `nonInteractiveElementRoleSchemas` until the function is called
// for the first time, so we will not take up the memory.
export function getNonInteractiveElementRoleSchemas(): ARIARoleRelationConcept[] {
  if (nonInteractiveElementRoleSchemas === null) {
    const roleKeys = [...ariaQuery.roles.keys()];
    const elementRoleEntries = [...ariaQuery.elementRoles];

    const nonInteractiveRoles = new Set<ARIARoleDefintionKey>(
      roleKeys
        .filter((name: ARIARoleDefintionKey) => {
          const role = ariaQuery.roles.get(name)!;
          return (
            !role.abstract &&
            // 'toolbar' does not descend from widget, but it does support
            // aria-activedescendant, thus in practice we treat it as a widget.
            name !== 'toolbar' &&
            !role.superClass.some((classes) => classes.includes('widget'))
          );
        })
        .concat(
          // The `progressbar` is descended from `widget`, but in practice, its
          // value is always `readonly`, so we treat it as a non-interactive role.
          'progressbar',
        ),
    );

    nonInteractiveElementRoleSchemas = elementRoleEntries.reduce(
      (accumulator: ARIARoleRelationConcept[], [elementSchema, roleSet]) => {
        if (
          [...roleSet].every((role): boolean => nonInteractiveRoles.has(role))
        ) {
          accumulator.push(elementSchema);
        }
        return accumulator;
      },
      [],
    );
  }

  return nonInteractiveElementRoleSchemas;
}
