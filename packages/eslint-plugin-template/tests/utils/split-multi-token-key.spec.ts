import { describe, expect, it } from 'vitest';
import { splitMultiTokenKey } from '../../src/utils/split-multi-token-key';

describe('splitMultiTokenKey', () => {
  it('pairs each token with the same condition', () => {
    expect(splitMultiTokenKey(['text-x', 'dark:text-y'], "'", 'cond')).toBe(
      "'text-x': cond, 'dark:text-y': cond",
    );
  });

  it('keeps a non-breaking space inside a token', () => {
    const nbsp = String.fromCharCode(0xa0);
    expect(splitMultiTokenKey([`a${nbsp}b`, 'c'], "'", 'x')).toBe(
      `'a${nbsp}b': x, 'c': x`,
    );
  });

  it('preserves the original double-quote character', () => {
    expect(splitMultiTokenKey(['a', 'b'], '"', 'c')).toBe('"a": c, "b": c');
  });

  it('falls back to single quotes when the key was unquoted', () => {
    expect(splitMultiTokenKey(['a', 'b'], null, 'c')).toBe("'a': c, 'b': c");
  });

  it('re-escapes the quote character inside a token', () => {
    expect(splitMultiTokenKey(["content-['x']", 'block'], "'", 'c')).toBe(
      "'content-[\\'x\\']': c, 'block': c",
    );
  });

  it('re-escapes backslashes inside a token', () => {
    expect(splitMultiTokenKey(['a\\b', 'c'], "'", 'c')).toBe(
      "'a\\\\b': c, 'c': c",
    );
  });

  it('re-escapes backticks and interpolation starts in a template literal', () => {
    expect(splitMultiTokenKey(['a`b', '${c}'], '`', 'x')).toBe(
      '`a\\`b`: x, `\\${c}`: x',
    );
  });

  it('leaves a dollar sign that starts no interpolation alone', () => {
    expect(splitMultiTokenKey(['$a', '${b}'], "'", 'x')).toBe(
      "'$a': x, '${b}': x",
    );
  });

  it('copies the condition text verbatim', () => {
    expect(splitMultiTokenKey(['a', 'b'], "'", 'x === "two words"')).toBe(
      `'a': x === "two words", 'b': x === "two words"`,
    );
  });
});
