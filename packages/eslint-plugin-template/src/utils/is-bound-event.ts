import { TmplAstBoundEvent } from '@angular-eslint/bundled-angular-compiler';

/**
 * Type guard to check if a node is a TmplAstBoundEvent (output event handler)
 */
export function isBoundEvent(node: unknown): node is TmplAstBoundEvent {
  return node instanceof TmplAstBoundEvent;
}
