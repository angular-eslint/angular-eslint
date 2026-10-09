/**
 * Builds the replacement text for a multi-token class map entry: one entry per
 * whitespace-separated token, each paired with the original condition text.
 */
export function splitMultiTokenKey(
  key: string,
  quote: string | null,
  conditionText: string,
): string {
  const quoteChar = quote ?? "'";
  // `key` is the parsed (unescaped) value, so it must be re-escaped before
  // being written back between quotes.
  const escape = (token: string) =>
    token.replace(/\\/g, '\\\\').split(quoteChar).join(`\\${quoteChar}`);
  return key
    .trim()
    .split(/\s+/)
    .map(
      (token) => `${quoteChar}${escape(token)}${quoteChar}: ${conditionText}`,
    )
    .join(', ');
}
