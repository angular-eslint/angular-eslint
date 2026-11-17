// A function declared in another file, which `followLocalCalls` must not follow.
export function format(value: number): string {
  return value.toFixed(2);
}
