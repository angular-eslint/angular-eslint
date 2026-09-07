import {
  AbsoluteSourceSpan,
  LiteralPrimitive,
  ParseSpan,
} from '@angular-eslint/bundled-angular-compiler';
import { describe, expect, it } from 'vitest';
import { isLiteralPrimitive } from '../../src/utils/literal-primitive';

describe('isLiteralPrimitive', () => {
  it('matches real compiler LiteralPrimitive instances', () => {
    const node = new LiteralPrimitive(
      new ParseSpan(0, 4),
      new AbsoluteSourceSpan(0, 4),
      null,
    );

    expect(node instanceof LiteralPrimitive).toBe(true);
    expect(isLiteralPrimitive(node)).toBe(true);
  });

  it('matches parser-stamped nodes from a different compiler copy', () => {
    const node = {
      type: 'LiteralPrimitive',
      value: null,
    };

    expect(node instanceof LiteralPrimitive).toBe(false);
    expect(isLiteralPrimitive(node as never)).toBe(true);
  });

  it('does not match other AST node types', () => {
    expect(
      isLiteralPrimitive({ type: 'PropertyRead', value: null } as never),
    ).toBe(false);
    expect(isLiteralPrimitive({ type: 'Binary' } as never)).toBe(false);
  });
});
