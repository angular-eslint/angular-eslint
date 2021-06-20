/**
 * It's important in our snapshot assertions which target modules on disk
 * that we are always grabbing a fresh copy of the file. Node's built-in
 * caching mechanism can get in the way of that so this utility helps
 * us work around the potential issue.
 *
 * (Having the return type as any makes it much easier to work with).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireUncached(modulePath: string): any {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}
