export function toPattern(value: readonly unknown[]): RegExp {
  return RegExp(`^(${value.join('|')})$`);
}
