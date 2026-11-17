import ts from 'typescript';

export type TextSource = ReturnType<typeof createTextSource>;

/**
 * Converts between offsets and the 1-based line/column positions ESLint
 * reports, using the same line terminators as ESLint.
 */
export function createTextSource(text: string) {
  const lineStarts = [0];
  for (let index = 0; index < text.length; index++) {
    const character = text.charCodeAt(index);
    if (character === 13 && text.charCodeAt(index + 1) === 10) {
      index++;
    }
    if (
      character === 10 ||
      character === 13 ||
      character === 0x2028 ||
      character === 0x2029
    ) {
      lineStarts.push(index + 1);
    }
  }
  return {
    text,
    offsetAt(line: number, column: number): number | undefined {
      const start = lineStarts[line - 1];
      if (start === undefined || column < 1 || !Number.isInteger(column)) {
        return undefined;
      }
      const offset = start + column - 1;
      const nextStart = lineStarts[line];
      if (
        nextStart !== undefined ? offset >= nextStart : offset > text.length
      ) {
        return undefined;
      }
      return offset;
    },
    locationAt(offset: number) {
      let start = 0;
      let end = lineStarts.length;
      while (start + 1 < end) {
        const middle = Math.floor((start + end) / 2);
        if (lineStarts[middle] > offset) {
          end = middle;
        } else {
          start = middle;
        }
      }
      return { line: start + 1, column: offset - lineStarts[start] + 1 };
    },
  };
}

export interface DecodedLiteral {
  /** The opening (and closing) quote character */
  quote: string;
  /** The value of the literal, with escape sequences decoded */
  text: string;
  /**
   * For every offset into `text` (including `text.length`), the offset in the
   * source file where the escape sequence or character producing it starts
   */
  offsets: number[];
}

/**
 * Decodes a string literal or a template literal without substitutions,
 * recording where each decoded character came from in the source file.
 * Returns undefined if the decoded value does not match TypeScript's.
 */
export function decodeLiteral(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
): DecodedLiteral | undefined {
  const start = literal.getStart(sourceFile);
  const quote = sourceFile.text[start];
  const raw = sourceFile.text.slice(start + 1, literal.end - 1);
  const offsets = [start + 1];
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false);
  let text = '';

  for (let index = 0; index < raw.length;) {
    const escape =
      raw[index] === '\\'
        ? /^\\(?:u\{[\da-fA-F]+\}|u[\da-fA-F]{4}|x[\da-fA-F]{2}|\r\n|[\s\S])/.exec(
            raw.slice(index),
          )?.[0]
        : undefined;
    const chunk =
      escape ?? (raw.startsWith('\r\n', index) ? '\r\n' : raw[index]);
    let decoded = chunk;

    if (escape) {
      scanner.setText(quote + chunk + quote);
      scanner.scan();
      decoded = scanner.getTokenValue();
    } else if (quote === '`' && chunk.startsWith('\r')) {
      decoded = '\n';
    }

    index += chunk.length;
    text += decoded;
    for (let count = 0; count < decoded.length; count++) {
      offsets.push(start + 1 + index);
    }
    if (!decoded.length) {
      offsets[offsets.length - 1] = start + 1 + index;
    }
  }

  if (text !== literal.text) {
    return undefined;
  }

  return { quote, text, offsets };
}

/**
 * Escapes text so that it can be inserted into the body of a string literal
 * delimited by `quote` and still decode to the same characters.
 */
export function escapeStringLiteralText(text: string, quote: string): string {
  return text.replace(/[\\\n\r\u2028\u2029'"]/g, (character) => {
    switch (character) {
      case '\\':
        return '\\\\';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        return character === quote ? `\\${character}` : character;
    }
  });
}

/**
 * Returns the value of `literal` if, in its entirety, it is exactly one
 * complete and valid string literal token, otherwise undefined.
 */
export function scanStringLiteral(literal: string): string | undefined {
  let valid = true;
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    /* skipTrivia */ false,
    ts.LanguageVariant.Standard,
    literal,
    () => {
      valid = false;
    },
  );
  const kind = scanner.scan();
  if (
    !valid ||
    kind !== ts.SyntaxKind.StringLiteral ||
    scanner.isUnterminated() ||
    scanner.getTokenEnd() !== literal.length
  ) {
    return undefined;
  }
  return scanner.getTokenValue();
}
