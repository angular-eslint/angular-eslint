import { dom } from 'aria-query';

const nonAriaElements = ['slot', 'math', 'rb', 'svg', 'template'];

let domElements: ReadonlySet<string> | null = null;
export function getDomElements(): ReadonlySet<string> {
  return (
    domElements ?? (domElements = new Set([...dom.keys(), ...nonAriaElements]))
  );
}
