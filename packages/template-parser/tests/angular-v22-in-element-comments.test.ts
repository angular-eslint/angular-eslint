import { describe, expect, it } from 'vitest';
import { parseForESLint } from '../src/index';

// Angular v22 allows TypeScript-style comments inside an element's opening
// tag, but the v22 tokenizer silently discards them: it emits no comment
// token, so they never reach `ast.comments` and are invisible to ESLint's
// inline-directive scanner. Classic HTML `<!-- -->` comments continue to flow
// through. These tests guard that current behaviour.
describe('Angular v22 in-element comments', () => {
  it('should parse an in-tag `/* */` comment without error and not surface it in comments', () => {
    const { ast } = parseForESLint(`<div /* a */ [x]="y">hi</div>`, {
      filePath: './foo.html',
    });

    expect(ast.comments).toEqual([]);
  });

  it('should parse a multiline in-tag `/* */` comment without error and not surface it in comments', () => {
    const { ast } = parseForESLint(`<div\n  /* inner */\n  [x]="y">hi</div>`, {
      filePath: './foo.html',
    });

    expect(ast.comments).toEqual([]);
  });

  it('should parse an in-tag `//` line comment without error and not surface it in comments', () => {
    const { ast } = parseForESLint(`<div\n  // line\n  [x]="y">hi</div>`, {
      filePath: './foo.html',
    });

    expect(ast.comments).toEqual([]);
  });

  it('should surface a classic HTML disable comment but not an accompanying in-tag comment', () => {
    const { ast } = parseForESLint(
      `<!-- eslint-disable-next-line @angular-eslint/template/foo -->\n<div\n  /* inner */\n  [x]="y">hi</div>`,
      { filePath: './foo.html' },
    );

    expect(ast.comments).toHaveLength(1);
    expect(ast.comments[0].type).toBe('Block');
    expect(ast.comments[0].value).toBe(
      'eslint-disable-next-line @angular-eslint/template/foo',
    );
  });
});
