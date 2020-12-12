import * as ariaQuery from 'aria-query';

// This package doesn't have type definitions.
const { AXObjects, elementAXObjects } = require('axobject-query');

import { getLiteralValue } from './get-literal-value';
import { getAttributeValue } from './get-attribute-value';

// This is a basic typing for schemas that are coming from the
// `axobject-query` package.
interface AXObjectSchema {
  name: string;
  attributes?: { name: string; value?: string }[];
}

// This set will contain all possible values for the `role` attribute,
// e.g. `button`, `navigation` or `presentation`.
const interactiveRoles = new Set<ariaQuery.ARIARoleDefintionKey>(
  [
    ...ariaQuery.roles.keys(),
    // 'toolbar' does not descend from widget, but it does support
    // aria-activedescendant, thus in practice we treat it as a widget.
    'toolbar' as ariaQuery.ARIARoleDefintionKey,
  ].filter((name: ariaQuery.ARIARoleDefintionKey) => {
    const role = ariaQuery.roles.get(name)!;
    return (
      !role.abstract &&
      role.superClass.some((classes) => classes.indexOf('widget') !== 0)
    );
  }),
);

const interactiveElementRoleSchemas: ariaQuery.ARIARoleRelationConcept[] = Array.from(
  ariaQuery.elementRoles,
).reduce(
  (
    accumulator: ariaQuery.ARIARoleRelationConcept[],
    [elementSchema, roleSet],
  ) => {
    if (Array.from(roleSet).some((role) => interactiveRoles.has(role))) {
      accumulator.push(elementSchema);
    }
    return accumulator;
  },
  [],
);

// This set will contain all possible roles in ARIA, which are
// type of `structure` or `window` (since we filter out `widget` type).
const interactiveAXObjects = new Set<string>(
  Array.from<string>(AXObjects.keys()).filter(
    (name) => AXObjects.get(name).type === 'widget',
  ),
);

// This will contain all schemas that are related to ARIA roles
// listed in the above set `interactiveAXObjects`.
const interactiveElementAXObjectSchemas: AXObjectSchema[] = Array.from(
  elementAXObjects as Map<AXObjectSchema, Set<string>>,
).reduce(
  (
    accumulator: AXObjectSchema[],
    [elementSchema, AXObjectSet]: [AXObjectSchema, Set<string>],
  ) => {
    if (
      Array.from(AXObjectSet).every((role) => interactiveAXObjects.has(role))
    ) {
      accumulator.push(elementSchema);
    }

    return accumulator;
  },
  [],
);

function checkIsInteractiveElement(node: any): boolean {
  function elementSchemaMatcher(
    elementSchema: ariaQuery.ARIARoleRelationConcept | AXObjectSchema,
  ) {
    return (
      node.name === elementSchema.name &&
      attributesComparator(elementSchema.attributes, node)
    );
  }

  // Check in elementRoles for inherent interactive role associations for
  // this element.
  const isInherentInteractiveElement = interactiveElementRoleSchemas.some(
    elementSchemaMatcher,
  );

  if (isInherentInteractiveElement) {
    return true;
  }

  // Check in elementAXObjects for AX Tree associations for this element.
  const isInteractiveAXElement = interactiveElementAXObjectSchemas.some(
    elementSchemaMatcher,
  );

  return isInteractiveAXElement;
}

const domElements = new Set<string>(ariaQuery.dom.keys());

/**
 * Returns boolean indicating whether the given element is
 * interactive on the DOM or not. Usually used when an element
 * has a dynamic handler on it and we need to discern whether or not
 * it's intention is to be interacted with on the DOM.
 */
export function isInteractiveElement(node: any): boolean {
  return domElements.has(node.name) && checkIsInteractiveElement(node);
}

function attributesComparator(baseAttributes: any[] = [], node: any): boolean {
  if (baseAttributes.length === 0) {
    return false;
  }

  const attributes = [...node.attributes, ...node.inputs];

  return baseAttributes.every((baseAttribute) =>
    attributes.some((attribute) => {
      if (node.name === 'a' && attribute.name === 'routerLink') {
        return true;
      } else if (baseAttribute.name !== attribute.name) {
        return false;
      } else if (
        baseAttribute.value &&
        baseAttribute.value !==
          getLiteralValue(getAttributeValue(node, baseAttribute.name))
      ) {
        return false;
      } else {
        return true;
      }
    }),
  );
}
