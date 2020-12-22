import * as ariaQuery from 'aria-query';
import type { ARIARoleDefintionKey, ARIARoleRelationConcept } from 'aria-query';

let interactiveElementRoleSchemas: ARIARoleRelationConcept[] | null = null;

// This function follows the lazy initialization pattern.
// Since this is a top-level module (it will be included via `require`), we do not need to
// initialize the `interactiveElementRoleSchemas` until the function is called
// for the first time, so we will not take up the memory.
export function getInteractiveElementRoleSchemas(): ARIARoleRelationConcept[] {
  if (interactiveElementRoleSchemas === null) {
    const roleKeys = [...ariaQuery.roles.keys()];
    const elementRoleEntries = [...ariaQuery.elementRoles];

    // This set will contain all possible values for the `role` attribute,
    // e.g. `button`, `navigation` or `presentation`.
    const interactiveRoles = new Set<ARIARoleDefintionKey>(
      roleKeys
        .filter((name: ARIARoleDefintionKey) => {
          const role = ariaQuery.roles.get(name)!;
          return (
            !role.abstract &&
            // The `progressbar` is descended from `widget`, but in practice, its
            // value is always `readonly`, so we treat it as a non-interactive role.
            name !== 'progressbar' &&
            role.superClass.some((classes) => classes.includes('widget'))
          );
        })
        .concat(
          // 'toolbar' does not descend from widget, but it does support
          // aria-activedescendant, thus in practice we treat it as a widget.
          'toolbar',
        ),
    );

    interactiveElementRoleSchemas = elementRoleEntries.reduce(
      (accumulator: ARIARoleRelationConcept[], [elementSchema, roleSet]) => {
        if ([...roleSet].some((role) => interactiveRoles.has(role))) {
          accumulator.push(elementSchema);
        }
        return accumulator;
      },
      [],
    );
  }

  return interactiveElementRoleSchemas;
}
