import { dom } from 'aria-query';

const nonAriaElements = [
  'slot',
  'rb',
  'template',
  // The Angular compiler has special handling for math and svg as namespaces. Their children have the namespace in the node name too.
  ':svg:svg',
  ':math:math',
];

let domElements: ReadonlySet<string> | null = null;
export function getDomElements(): ReadonlySet<string> {
  return (
    domElements ?? (domElements = new Set([...dom.keys(), ...nonAriaElements]))
  );
}
