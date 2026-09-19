import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';

type DirectiveMatcher = (name: string) => boolean;

const REGEX_LITERAL_PATTERN = /^\/(.+)\/([a-z]*)$/;

/**
 * Compiles an `ignoreWithDirectives` option into a predicate that reports
 * whether an element carries one of the ignored directives.
 *
 * Entries wrapped in slashes, e.g. `/^tui/`, are treated as regular
 * expressions (an optional flags suffix is supported, e.g. `/^tui/i`).
 * All other entries are matched exactly against the directive name.
 */
export function createIgnoredDirectiveMatcher(
  ignoreWithDirectives: readonly string[] | undefined,
): (element: TmplAstElement) => boolean {
  if (!ignoreWithDirectives || ignoreWithDirectives.length === 0) {
    return () => false;
  }

  const matchers: readonly DirectiveMatcher[] = ignoreWithDirectives.map(
    (entry) => {
      const regexLiteral = REGEX_LITERAL_PATTERN.exec(entry);
      if (regexLiteral) {
        const pattern = new RegExp(regexLiteral[1], regexLiteral[2]);
        return (name) => pattern.test(name);
      }
      return (name) => name === entry;
    },
  );

  const isIgnoredName: DirectiveMatcher = (name) =>
    matchers.some((matcher) => matcher(name));

  return ({ inputs, attributes }) =>
    inputs.some(({ name }) => isIgnoredName(name)) ||
    attributes.some(({ name }) => isIgnoredName(name));
}
