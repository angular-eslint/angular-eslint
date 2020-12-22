export function getLiteralValue<T>(value: T): boolean | T {
  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }
  }

  return value;
}
