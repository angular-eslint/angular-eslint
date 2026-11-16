/**
 * Builds the replacement text for a multi-token class map entry: one entry per
 * class token, each paired with the original condition text.
 */
export function splitMultiTokenKey(
  tokens: readonly string[],
  quote: string | null,
  conditionText: string,
): string {
  const quoteChar = quote ?? "'";
  // Tokens come from the parsed (unescaped) key, so they must be re-escaped
  // before being written back between quotes. In a template literal, `${`
  // must also stay escaped, or it would start an interpolation.
  const escape = (token: string) => {
    const escaped = token
      .replace(/\\/g, '\\\\')
      .split(quoteChar)
      .join(`\\${quoteChar}`);
    return quoteChar === '`' ? escaped.replace(/\$\{/g, '\\${') : escaped;
  };
  return tokens
    .map(
      (token) => `${quoteChar}${escape(token)}${quoteChar}: ${conditionText}`,
    )
    .join(', ');
}
