/**
 * ===============================================================================
 *
 * This file contains general purpose utilities which are not specific to one of
 * the plugins.
 *
 * ===============================================================================
 */

/**
 * Return the last item of the given array.
 */
export function getLast<T extends readonly unknown[]>(items: T): T[number] {
  return items.slice(-1)[0];
}

export const objectKeys = Object.keys as <T>(
  o: T,
) => readonly Extract<keyof T, string>[];

/**
 * Enforces the invariant that the input is an array.
 */
export function arrayify<T>(value: T | readonly T[]): readonly T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return (value ? [value] : []) as readonly T[];
}

// Needed because in the current Typescript version (TS 3.3.3333), Boolean() cannot be used to perform a null check.
// For more, see: https://github.com/Microsoft/TypeScript/issues/16655
export const isNotNullOrUndefined = <T>(
  input: null | undefined | T,
): input is T => input !== null && input !== undefined;

export const kebabToCamelCase = (value: string): string =>
  value.replace(/-[a-zA-Z]/g, ({ 1: letterAfterDash }) =>
    letterAfterDash.toUpperCase(),
  );

/**
 * Convert an array to human-readable text.
 */
export const toHumanReadableText = (items: readonly string[]): string => {
  const itemsLength = items.length;

  if (itemsLength === 1) {
    return `"${items[0]}"`;
  }

  return `${items
    .map((item) => `"${item}"`)
    .slice(0, itemsLength - 1)
    .join(', ')} or "${[...items].pop()}"`;
};

export const toPattern = (value: readonly unknown[]): RegExp =>
  RegExp(`^(${value.join('|')})$`);

export function capitalize<T extends string>(text: T): Capitalize<T> {
  return `${text[0].toUpperCase()}${text.slice(1)}` as Capitalize<T>;
}

export function withoutBracketsAndWhitespaces(text: string): string {
  return text.replace(/[[\]\s]/g, '');
}
