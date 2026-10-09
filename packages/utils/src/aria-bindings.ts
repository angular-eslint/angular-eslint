export const ATTR_PREFIX = 'attr.';

/**
 * Returns the binding type as written in the source. The template parser
 * normalizes some bindings (e.g. `[attr.aria-label]`) and keeps the original
 * type in `__originalType`.
 */
export function getOriginalBindingType<T>(binding: {
  type: T;
  __originalType?: T;
}): T {
  return binding.__originalType ?? binding.type;
}
