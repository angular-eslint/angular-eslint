import * as templateParser from '@angular-eslint/template-parser';
import type { ESLint } from 'eslint';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import bananaInBox, { RULE_NAME } from '../src/rules/banana-in-box';

/**
 * Integration tests which run a real ESLint Linter (flat config) against the
 * template parser to prove that inline directive comments are honoured in
 * Angular templates. As of Angular v22, TypeScript-style comments are allowed
 * inside an element's opening tag (and are surfaced by the compiler from
 * v22.0.5), so eslint-disable directives can now also be used from within an
 * element's opening tag, in addition to classic HTML `<!-- -->` comments.
 */
describe('inline comment directives in templates', () => {
  const linter = new Linter();

  function lintTemplate(code: string) {
    return linter.verify(
      code,
      {
        files: ['**/*.html'],
        plugins: {
          '@angular-eslint/template': {
            rules: {
              [RULE_NAME]: bananaInBox,
            },
          } as unknown as ESLint.Plugin,
        },
        languageOptions: {
          parser: templateParser,
        },
        linterOptions: {
          reportUnusedDisableDirectives: 'error',
        },
        rules: {
          [`@angular-eslint/template/${RULE_NAME}`]: 'error',
        },
      },
      'test.html',
    );
  }

  it('should report the violation when there is no disable directive (control case)', () => {
    const messages = lintTemplate(`<input ([foo])="bar">`);

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe(`@angular-eslint/template/${RULE_NAME}`);
  });

  it('should honour eslint-disable-next-line in a classic HTML comment', () => {
    const messages = lintTemplate(
      `<!-- eslint-disable-next-line @angular-eslint/template/banana-in-box -->\n<input ([foo])="bar">`,
    );

    expect(messages).toEqual([]);
  });

  it('should honour eslint-disable-next-line in an in-tag // comment', () => {
    const messages = lintTemplate(
      `<input\n  // eslint-disable-next-line @angular-eslint/template/banana-in-box\n  ([foo])="bar">`,
    );

    expect(messages).toEqual([]);
  });

  it('should honour eslint-disable-next-line in an in-tag block comment', () => {
    const messages = lintTemplate(
      `<input\n  /* eslint-disable-next-line @angular-eslint/template/banana-in-box */\n  ([foo])="bar">`,
    );

    expect(messages).toEqual([]);
  });

  it('should honour eslint-disable-line in an in-tag block comment on the same line', () => {
    const messages = lintTemplate(
      `<input ([foo])="bar" /* eslint-disable-line @angular-eslint/template/banana-in-box */>`,
    );

    expect(messages).toEqual([]);
  });

  it('should honour eslint-disable in an in-tag block comment for the remainder of the template', () => {
    const messages = lintTemplate(
      `<input /* eslint-disable @angular-eslint/template/banana-in-box */ ([foo])="bar">\n<input ([baz])="qux">`,
    );

    expect(messages).toEqual([]);
  });

  it('should NOT treat eslint-disable in an in-tag // comment as a directive (block comments only, per standard ESLint semantics)', () => {
    const messages = lintTemplate(
      `<input\n  // eslint-disable @angular-eslint/template/banana-in-box\n  ([foo])="bar">`,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe(`@angular-eslint/template/${RULE_NAME}`);
  });

  it('should report unused disable directives in in-tag comments', () => {
    const messages = lintTemplate(
      `<input\n  // eslint-disable-next-line @angular-eslint/template/banana-in-box\n  [(foo)]="bar">`,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('Unused eslint-disable directive');
  });
});
