/**
 * Builds the replacement text for a multi-token class map entry: one entry per
 * class token, each paired with the original condition text. The tokens are
 * written verbatim, so callers must only pass tokens that need no escaping
 * between the given quotes.
 */
export function splitMultiTokenKey(
  tokens: readonly string[],
  quote: string | null,
  conditionText: string,
): string {
  const quoteChar = quote ?? "'";
  return tokens
    .map((token) => `${quoteChar}${token}${quoteChar}: ${conditionText}`)
    .join(', ');
}
