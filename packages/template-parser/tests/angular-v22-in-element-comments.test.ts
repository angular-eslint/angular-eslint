import { describe, expect, it } from 'vitest';
import { parseForESLint } from '../src/index';

// Angular v22 allows TypeScript-style comments inside an element's opening
// tag. As of @angular/compiler v22.0.5 the tokenizer emits comment tokens for
// them, so they reach `ast.comments` just like classic HTML `<!-- -->`
// comments. We deliberately surface them to ESLint so that inline directives
// such as `eslint-disable-next-line` can be used within an element's opening
// tag. `//` comments are surfaced as Line comments (matching ESLint's
// semantics for line-based directives) and block-style comments as Block
// comments. These tests guard that behaviour.
describe('Angular v22 in-element comments', () => {
  it('should surface an in-tag block comment as a Block comment token', () => {
    const code = `<div /* a */ [x]="y">hi</div>`;
    const { ast } = parseForESLint(code, {
      filePath: './foo.html',
    });

    expect(ast.comments).toHaveLength(1);
    expect(ast.comments[0].type).toBe('Block');
    expect(ast.comments[0].value).toBe(' a ');
    expect(code.slice(ast.comments[0].range[0], ast.comments[0].range[1])).toBe(
      '/* a */',
    );
  });

  it('should surface a multiline in-tag block comment as a Block comment token', () => {
    const code = `<div\n  /* line1\n  line2 */\n  [x]="y">hi</div>`;
    const { ast } = parseForESLint(code, {
      filePath: './foo.html',
    });

    expect(ast.comments).toHaveLength(1);
    expect(ast.comments[0].type).toBe('Block');
    expect(ast.comments[0].value).toBe(' line1\n  line2 ');
    expect(code.slice(ast.comments[0].range[0], ast.comments[0].range[1])).toBe(
      '/* line1\n  line2 */',
    );
  });

  it('should surface an in-tag `//` comment as a Line comment token', () => {
    const code = `<div\n  // line\n  [x]="y">hi</div>`;
    const { ast } = parseForESLint(code, {
      filePath: './foo.html',
    });

    expect(ast.comments).toHaveLength(1);
    expect(ast.comments[0].type).toBe('Line');
    expect(ast.comments[0].value).toBe(' line');
    expect(code.slice(ast.comments[0].range[0], ast.comments[0].range[1])).toBe(
      '// line',
    );
  });

  it('should surface both a classic HTML comment and an in-tag comment, sorted by range', () => {
    const code = `<!-- eslint-disable-next-line @angular-eslint/template/foo -->\n<div\n  /* inner */\n  [x]="y">hi</div>`;
    const { ast } = parseForESLint(code, { filePath: './foo.html' });

    expect(ast.comments).toHaveLength(2);

    expect(ast.comments[0].type).toBe('Block');
    expect(ast.comments[0].value).toBe(
      'eslint-disable-next-line @angular-eslint/template/foo',
    );
    expect(code.slice(ast.comments[0].range[0], ast.comments[0].range[1])).toBe(
      '<!-- eslint-disable-next-line @angular-eslint/template/foo -->',
    );

    expect(ast.comments[1].type).toBe('Block');
    expect(ast.comments[1].value).toBe(' inner ');
    expect(code.slice(ast.comments[1].range[0], ast.comments[1].range[1])).toBe(
      '/* inner */',
    );
    expect(ast.comments[0].range[0]).toBeLessThan(ast.comments[1].range[0]);
  });
});
