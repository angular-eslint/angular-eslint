import { dom } from 'aria-query';

let domElements: Set<string> | null = null;
export function getDomElements(): Set<string> {
  return domElements || (domElements = new Set<string>(dom.keys()));
}
