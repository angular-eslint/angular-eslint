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

export interface LiteralText {
  /** The opening (and closing) quote character */
  quote: string;
  /** The source file offset of the first character after the opening quote */
  start: number;
  /** The source file offset of the closing quote */
  end: number;
  /** The value of the literal, with escape sequences decoded */
  text: string;
  /**
   * Every escape sequence (and, in template literals, every normalised line
   * break) in source order, as flat `[textStart, textEnd, sourceStart, sourceEnd]`
   * quadruples. Everything between them decodes to itself, so this is all that
   * is needed to map between offsets in `text` and in the source file.
   */
  segments: number[];
}

const escapeSequence =
  /\\(?:u\{[\da-fA-F]+\}|u[\da-fA-F]{4}|x[\da-fA-F]{2}|\r\n|[\s\S])/y;

/**
 * Decodes a string literal or a template literal without substitutions,
 * recording where its escape sequences are in the source file.
 * Returns undefined if the decoded value does not match TypeScript's.
 */
export function decodeLiteralText(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
): LiteralText | undefined {
  const source = sourceFile.text;
  const start = literal.getStart(sourceFile) + 1;
  const end = literal.end - 1;
  const quote = source[start - 1];
  const special = quote === '`' ? /[\\\r]/g : /\\/g;
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false);
  const segments: number[] = [];
  let text = '';

  for (let index = start; index < end;) {
    special.lastIndex = index;
    const next = Math.min(special.exec(source)?.index ?? end, end);
    text += source.slice(index, next);
    index = next;
    if (index === end) {
      break;
    }

    let chunk: string | undefined;
    let decoded: string;
    if (source[index] === '\\') {
      escapeSequence.lastIndex = index;
      chunk = escapeSequence.exec(source)?.[0];
      if (!chunk || index + chunk.length > end) {
        return undefined;
      }
      scanner.setText(quote + chunk + quote);
      scanner.scan();
      decoded = scanner.getTokenValue();
    } else {
      // Template literals normalise CRLF and CR line breaks to LF
      chunk = source.startsWith('\r\n', index) ? '\r\n' : '\r';
      decoded = '\n';
    }

    segments.push(
      text.length,
      text.length + decoded.length,
      index,
      index + chunk.length,
    );
    text += decoded;
    index += chunk.length;
  }

  if (text !== literal.text) {
    return undefined;
  }

  return { quote, start, end, text, segments };
}

/**
 * Index of the last segment whose value at `field` (0: textStart,
 * 2: sourceStart) is at most `offset`, or -1 if there is none
 */
function findSegment(segments: number[], field: number, offset: number) {
  let low = 0;
  let high = segments.length / 4;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (segments[middle * 4 + field] <= offset) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low - 1;
}

/**
 * Maps an offset into the decoded text to the source file offset where the
 * character at that offset starts (after any line continuations before it).
 * `boundary` is false if the offset falls inside the value of an escape
 * sequence, such as between the two UTF-16 code units of `\u{1F600}`, in which
 * case the returned offset is the end of the escape sequence.
 */
export function sourceOffsetAt(
  literal: LiteralText,
  textOffset: number,
): { offset: number; boundary: boolean } {
  const { segments } = literal;
  const index = findSegment(segments, 0, textOffset);
  if (index < 0) {
    return { offset: literal.start + textOffset, boundary: true };
  }
  const [textStart, textEnd, sourceStart, sourceEnd] = segments.slice(
    index * 4,
    index * 4 + 4,
  );
  if (textOffset >= textEnd) {
    return { offset: sourceEnd + textOffset - textEnd, boundary: true };
  }
  return textOffset === textStart
    ? { offset: sourceStart, boundary: true }
    : { offset: sourceEnd, boundary: false };
}

/**
 * Maps a source file offset inside the literal to the offset in the decoded
 * text, first moving it to the start (or with `forwards`, the end) of any
 * escape sequence it is inside, so that the literal can be cut there.
 */
function alignedOffsetAt(
  literal: LiteralText,
  sourceOffset: number,
  forwards: boolean,
): { source: number; text: number } {
  const { segments } = literal;
  const index = findSegment(segments, 2, sourceOffset);
  if (index < 0) {
    return { source: sourceOffset, text: sourceOffset - literal.start };
  }
  const [textStart, textEnd, sourceStart, sourceEnd] = segments.slice(
    index * 4,
    index * 4 + 4,
  );
  if (sourceOffset >= sourceEnd) {
    return { source: sourceOffset, text: textEnd + sourceOffset - sourceEnd };
  }
  return forwards && sourceOffset !== sourceStart
    ? { source: sourceEnd, text: textEnd }
    : { source: sourceStart, text: textStart };
}

/**
 * Escape sequences only ever extend forwards, and the replacement text is
 * always fully escaped, so the only places an edit can change how the rest of
 * the literal is read are where it meets the text before and after it: the
 * escape sequence just before it could absorb what follows (e.g. a digit after
 * `\0`). Re-reading this many source characters either side of the edit, which
 * is more than the longest such interaction, is enough to catch that.
 */
const editContext = 16;

/**
 * Maps an edit to the decoded text of a single- or double-quoted string
 * literal onto the source file, escaping the replacement text. Returns
 * undefined unless the edited literal is guaranteed to decode to exactly the
 * edited text, e.g. if the edit would split an escape sequence or change how
 * one next to it is read.
 */
export function mapStringLiteralEdit(
  literal: LiteralText,
  source: string,
  edit: { range: readonly number[]; text: string },
): { range: [number, number]; text: string } | undefined {
  const [start, end] = edit.range;
  if (!(start >= 0 && start <= end && end <= literal.text.length)) {
    return undefined;
  }
  const sourceStart = sourceOffsetAt(literal, start);
  const sourceEnd = sourceOffsetAt(literal, end);
  if (!sourceStart.boundary || !sourceEnd.boundary) {
    return undefined;
  }

  const text = escapeStringLiteralText(edit.text, literal.quote);
  const range: [number, number] = [sourceStart.offset, sourceEnd.offset];

  // Without escape sequences, every character in the literal is read on its own
  if (!literal.segments.length) {
    return { range, text };
  }

  const before = alignedOffsetAt(
    literal,
    Math.max(literal.start, sourceStart.offset - editContext),
    false,
  );
  const after = alignedOffsetAt(
    literal,
    Math.min(literal.end, sourceEnd.offset + editContext),
    true,
  );

  const editedSource =
    source.slice(before.source, sourceStart.offset) +
    text +
    source.slice(sourceEnd.offset, after.source);
  const editedText =
    literal.text.slice(before.text, start) +
    edit.text +
    literal.text.slice(end, after.text);
  if (
    scanStringLiteral(literal.quote + editedSource + literal.quote) !==
    editedText
  ) {
    return undefined;
  }

  return { range, text };
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
 * Like `decodeLiteralText()`, but with the source file offset of every
 * character, for callers that need random access to it.
 */
export function decodeLiteral(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
): DecodedLiteral | undefined {
  const decoded = decodeLiteralText(literal, sourceFile);
  if (!decoded) {
    return undefined;
  }
  const offsets: number[] = [];
  for (let offset = 0; offset <= decoded.text.length; offset++) {
    offsets.push(sourceOffsetAt(decoded, offset).offset);
  }
  return { quote: decoded.quote, text: decoded.text, offsets };
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
