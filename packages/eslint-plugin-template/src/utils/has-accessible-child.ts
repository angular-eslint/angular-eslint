import { TmplAstElement } from '@angular/compiler';
import { isHiddenFromScreenReader } from './is-hidden-from-screen-reader';

export function hasAccessibleChild({ children }: TmplAstElement): boolean {
  return children.some(
    (child) =>
      !(child instanceof TmplAstElement) || !isHiddenFromScreenReader(child),
  );
}
