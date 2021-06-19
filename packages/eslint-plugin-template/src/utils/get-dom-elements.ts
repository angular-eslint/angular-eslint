import { dom } from 'aria-query';

let domElements: ReadonlySet<string> | null = null;
export function getDomElements(): ReadonlySet<string> {
  return domElements ?? (domElements = new Set(dom.keys()));
}
