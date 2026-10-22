import { ESLint, type Linter } from 'eslint';
import { HtmlParser } from '@angular-eslint/bundled-angular-compiler';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import processors, {
  createProcessor,
  type ProcessorOptions,
  isFileLikelyToContainComponentDeclarations,
} from '../src/processors';

// typescript's exports are non-configurable getters, so wrap createSourceFile to observe parsing
vi.mock('typescript', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof ts }>();
  return {
    ...actual,
    default: {
      ...actual.default,
      createSourceFile: vi.fn(actual.default.createSourceFile),
    },
  };
});

describe('extract-inline-html', () => {
  describe('isFileLikelyToContainComponents()', () => {
    interface TestCase {
      text: string;
      filename: string;
      expected: boolean;
    }

    const testCases: TestCase[] = [
      {
        text: '',
        filename: 'foo.component.ts',
        expected: true, // Likely filename suffix
      },
      {
        text: '',
        filename: 'foo.ts',
        expected: false, // Unlikely filename suffix and no references
      },
      {
        text: `
          @Component({
            selector: '',
            foo: true
          })
          export class Component {}
        `,
        filename: 'bar.cmp.ts',
        expected: false, // No reference to @angular/core
      },
      {
        text: `
          import { Component } from '@angular/core';

          @Component({
            selector: '',
            foo: true
          })
          export class Component {}
        `,
        filename: 'anything.ts',
        expected: true, // References both Component and @angular/core
      },
    ];

    testCases.forEach((tc, i) => {
      it(`should return true if the given file contents and name are likely to contain Component declarations, CASE: ${i}`, () => {
        expect(
          isFileLikelyToContainComponentDeclarations(tc.text, tc.filename),
        ).toEqual(tc.expected);
      });
    });
  });

  describe('preprocess()', () => {
    describe('malformed component files/component files without inline templates', () => {
      const testCases = [
        {
          input: `
          @Component({
            selector: '',
            foo: true
          })
          export class Component {}
        `,
        },
        {
          input: `
          export class Component {}
        `,
        },
        {
          input: `

        `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should not transform malformed components, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([tc.input]);
        });
      });
    });

    describe('components with separate template files', () => {
      const testCases = [
        {
          input: `
          @Component({
            templateUrl: '',
          })
          export class Component {}
        `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should not transform components with separate template files, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([tc.input]);
        });
      });
    });

    describe('components with simple inline template string', () => {
      it('should work when the template initializer is a simple string literal', () => {
        const input = `
          @Component({
            selector: 'app-a',
            template: '<h1>Hello, A!</h1>',
            styleUrls: ['./a.component.scss']
          })
          export class ComponentA {}
        `;

        expect(
          processors['extract-inline-html'].preprocess(
            input,
            'test.component.ts',
          ),
        ).toEqual([
          input,
          {
            filename: 'inline-template-test.component.ts-1.component.html',
            text: '<h1>Hello, A!</h1>',
          },
        ]);
      });

      it(`should exclude the backticks from the template literal with interpolations`, () => {
        const input = `
          @Component({
            template: \`hello \${name}\`,
          })
          export class ExampleComponent {}
          `;
        expect(
          processors['extract-inline-html'].preprocess(
            input,
            'test.component.ts',
          ),
        ).toEqual([
          input,
          {
            filename: `inline-template-test.component.ts-1.component.html`,
            text: 'hello ${name}',
          },
        ]);
      });
    });

    describe('components with inline templates', () => {
      const inlineTemplate = `
        <input type="text" name="foo" ([ngModel])="foo">

        <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
        <div [oneWay]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
      `;
      const testCases = [
        {
          filename: 'test.page.ts', // likely custom file suffix
          input: `
            @Component({
              selector: "app-example",
              template: \`${inlineTemplate}\`,
              styleUrls: ['./example.component.scss'],
              inputs: [],
              outputs: [],
              host: {}
            })
            export class ExampleComponent implements OnInit {

              @Output() onFoo = new EventEmitter();

              constructor() { }

              ngOnInit() {
              }

            }

        `,
        },
        {
          filename: 'test.component.ts',
          // Space before closing curly brace: https://github.com/angular-eslint/angular-eslint/issues/68
          input: `
            @Component({
              selector: "app-example",
              template: \`${inlineTemplate}\`,
              styleUrls: ['./example.component.scss'],
              inputs: [],
              outputs: [],
              host: {}
             })
            export class ExampleComponent implements OnInit {

              @Output() onFoo = new EventEmitter();

              constructor() { }

              ngOnInit() {
              }

            }

        `,
        },
        {
          filename: 'test.component.ts',
          // prettier-ignore comment within metadata https://github.com/angular-eslint/angular-eslint/issues/60
          input: `
            @Component({
              selector: "app-example",
              // prettier-ignore
              template: \`${inlineTemplate}\`,
              styleUrls: ['./example.component.scss'],
              inputs: [],
              outputs: [],
              host: {}
            })
            export class ExampleComponent implements OnInit {

              @Output() onFoo = new EventEmitter();

              constructor() { }

              ngOnInit() {
              }

            }

        `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should extract the inline HTML of components with inline templates, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(tc.input, tc.filename),
          ).toEqual([
            tc.input,
            {
              filename: `inline-template-${tc.filename}-1.component.html`,
              text: inlineTemplate,
            },
          ]);
        });
      });
    });

    describe('components with inline templates - continued', () => {
      const inlineTemplate = `
        <div [style.height]="aBool ? '100px' : '200px'"></div>
        <div [style]="{height: this.aBool ? '100px' : '200px'}"></div>
        <div [style]="{height: '100px'}"></div>
      `;
      const testCases = [
        {
          // Ternary operator within inline templates: https://github.com/angular-eslint/angular-eslint/issues/60
          input: `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-root',
              template: \`${inlineTemplate}\`,
              styleUrls: ['./app.component.scss']
            })
            export class AppComponent {
              public aBool = false;
              public aStyle = {height: this.aBool ? '100px' : '200px'};
            }
        `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should extract the inline HTML of components with inline templates, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([
            tc.input,
            {
              filename: 'inline-template-test.component.ts-1.component.html',
              text: inlineTemplate,
            },
          ]);
        });
      });
    });

    describe('components with inline templates and CRLF', () => {
      const inlineTemplate = `\r\n
        <div [style.height]="aBool ? '100px' : '200px'"></div>\r\n
        <div [style]="{height: this.aBool ? '100px' : '200px'}"></div>\r\n
        <div [style]="{height: '100px'}"></div>\r\n
      `;

      const testCases = [
        {
          input: `
            import {Component} from '@angular/core';\r\n
\r\n
            @Component({\r\n
              selector: 'app-root',\r\n
              template: \`${inlineTemplate}\`,\r\n
              styleUrls: ['./app.component.scss']\r\n
            })\r\n
            export class AppComponent {\r\n
              public aBool = false;\r\n
              public aStyle = {height: this.aBool ? '100px' : '200px'};\r\n
            }\r\n
        `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should extract the inline HTML of components with inline templates, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([
            tc.input,
            {
              filename: 'inline-template-test.component.ts-1.component.html',
              text: inlineTemplate,
            },
          ]);
        });
      });
    });

    // https://github.com/angular-eslint/angular-eslint/issues/207
    describe('components with inline templates containing escape characters', () => {
      /* eslint-disable no-useless-escape */
      const inlineTemplateContainingEscapeCharacters1 = `
        <input [value]="\\\${{this.aCost}} USD"></input>
        <input [value]="'It\\\'s free'"></input>
      `;
      /* eslint-enable no-useless-escape */

      const testCases = [
        // NOTE: intentionally using variable for input and expected extraction assertion
        {
          input: `
            import {Component} from '@angular/core';
            @Component({
              selector: 'app-root',
              template: \`${inlineTemplateContainingEscapeCharacters1}\`,
              styleUrls: ['./app.component.scss']
            })
            export class AppComponent {
              public aCost = 20;
            }
          `,
          expectedExtraction: inlineTemplateContainingEscapeCharacters1,
        },
        // NOTE: intentionally NOT using a variable within the test code to ensure broader coverage (and to avoid test-specific escape logic)
        {
          input: `
            @Component({
              selector: 'app-component',
              template: \`
                <component
                  [prop]="true ? 'test for \\'@\\' escaping' : 'false'"
                ></component>
              \`
            })
            export class AppComponent {}
          `,
          expectedExtraction: `
                <component
                  [prop]="true ? 'test for \\'@\\' escaping' : 'false'"
                ></component>
              `,
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should extract the inline HTML of components with inline templates, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([
            tc.input,
            {
              filename: 'inline-template-test.component.ts-1.component.html',
              text: tc.expectedExtraction,
            },
          ]);
        });
      });
    });

    describe('multiple components in a single file', () => {
      it(`should support extracting inline templates from multiple Components in a single file`, () => {
        const input = `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-a',
            template: '<h1>Hello, A!</h1>',
            styleUrls: ['./a.component.scss']
          })
          export class ComponentA {}

          @Component({
            selector: 'app-b',
            template: '<h1>Hello, B!</h1>',
            styleUrls: ['./b.component.scss']
          })
          export class ComponentB {}
        `;
        expect(
          processors['extract-inline-html'].preprocess(
            input,
            'multiple-in-one.component.ts',
          ),
        ).toEqual([
          input,
          {
            filename:
              'inline-template-multiple-in-one.component.ts-1.component.html',
            text: '<h1>Hello, A!</h1>',
          },
          {
            filename:
              'inline-template-multiple-in-one.component.ts-2.component.html',
            text: '<h1>Hello, B!</h1>',
          },
        ]);
      });
    });

    describe('components within blocks', () => {
      it(`should support extracting inline templates from components that are not at the top-level`, () => {
        const input = `
          import { Component } from '@angular/core';

          describe('nested', () => {
            describe('arrow', () => {
              @Component({
                selector: 'app-a',
                template: '<h1>Arrow</h1>',
                styleUrls: ['./a.component.scss']
              })
              class ArrowComponent {}
            });

            describe('function', function () {
              @Component({
                selector: 'app-b',
                template: '<h1>Function</h1>',
                styleUrls: ['./b.component.scss']
              })
              class FunctionComponent {}
            });

            (() => {
              @Component({
                selector: 'app-b',
                template: '<h1>Parenthesized</h1>',
                styleUrls: ['./b.component.scss']
              })
              class ParenthesizedComponent {}
            });
          });

          // The following statements test the early-exiting
          // logic in the processor when it walks the
          // syntax tree to find class declarations.

          type A = number;

          let b: string[] = [1, 2, 3];

          enum C {
            D = 1,
          }

          interface E {
            f: string;
          }
        `;
        expect(
          processors['extract-inline-html'].preprocess(
            input,
            'multiple-in-blocks.spec.ts',
          ),
        ).toEqual([
          input,
          {
            filename:
              'inline-template-multiple-in-blocks.spec.ts-1.component.html',
            text: '<h1>Arrow</h1>',
          },
          {
            filename:
              'inline-template-multiple-in-blocks.spec.ts-2.component.html',
            text: '<h1>Function</h1>',
          },
          {
            filename:
              'inline-template-multiple-in-blocks.spec.ts-3.component.html',
            text: '<h1>Parenthesized</h1>',
          },
        ]);
      });
    });
  });

  describe('postprocess()', () => {
    describe('messages only from component source', () => {
      const mockError = {
        ruleId: 'quotes',
        severity: 2,
        message: 'Strings must use singlequote.',
        line: 1,
        column: 13,
        nodeType: 'Literal',
        messageId: 'wrongQuotes',
        endLine: 1,
        endColumn: 19,
        fix: { range: [12, 18], text: "'text'" },
      };
      const testCases = [
        {
          multiDimensionalMessages: [[mockError]],
        },
        {
          multiDimensionalMessages: [[mockError], []],
        },
      ];

      testCases.forEach((tc, i) => {
        it(`should not adjust message locations from the template source, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].postprocess(
              tc.multiDimensionalMessages,
              'test.component.ts',
            ),
          ).toEqual(tc.multiDimensionalMessages[0]);
        });
      });
    });

    describe('messages from inline template HTML', () => {
      it('should adjust message locations on the first line from the inline templates', () => {
        const fileContent = `
          @Component({
            template: '<div ([ngModel])="value"></div>',
          })
          export class Component {
            value = '';
          }
        `;
        processors['extract-inline-html'].preprocess(
          fileContent,
          'test.component.ts',
        );
        const mockError = {
          ruleId: 'banana-in-box',
          severity: 2,
          message: 'Invalid binding syntax. Use [(expr)] instead',
          line: 1,
          column: 6,
          nodeType: 'Literal',
          messageId: 'bananaInBox',
          endLine: 1,
          endColumn: 17,
          fix: { range: [6, 17], text: '[(ngModel)]' },
        };
        const expectedMessage = {
          ...mockError,
          line: 3,
          column: 29,
          endLine: 3,
          endColumn: 40,
          fix: { range: [53, 64], text: '[(ngModel)]' },
        };

        expect(
          processors['extract-inline-html'].postprocess(
            [[], [mockError]],
            'test.component.ts',
          ),
        ).toEqual([expectedMessage]);
      });

      it('should not adjust the columns for locations after the first line', () => {
        const fileContent = `
          @Component({
            template: \`
              <div ([ngModel])="value"></div>
            \`,
          })
          export class Component {
            value = '';
          }
        `;
        processors['extract-inline-html'].preprocess(
          fileContent,
          'test.component.ts',
        );
        const mockError = {
          ruleId: 'banana-in-box',
          severity: 2,
          message: 'Invalid binding syntax. Use [(expr)] instead',
          line: 2,
          column: 20,
          nodeType: 'Literal',
          messageId: 'bananaInBox',
          endLine: 2,
          endColumn: 31,
          fix: { range: [21, 32], text: '[(ngModel)]' },
        };
        const expectedMessage = {
          ...mockError,
          line: 4,
          endLine: 4,
          fix: { range: [68, 79], text: '[(ngModel)]' },
        };

        expect(
          processors['extract-inline-html'].postprocess(
            [[], [mockError]],
            'test.component.ts',
          ),
        ).toEqual([expectedMessage]);
      });

      it('should adjust the start column but not the end column when the message location starts on the first line and ends on the second', () => {
        const fileContent = `
          @Component({
            template: \`<div>Hello
            World</div>\`,
          })
          export class Component {
            value = '';
          }
        `;
        processors['extract-inline-html'].preprocess(
          fileContent,
          'test.component.ts',
        );
        const mockError = {
          ruleId: 'test',
          severity: 2,
          message: 'test',
          line: 1,
          column: 6,
          nodeType: 'test',
          messageId: 'test',
          endLine: 2,
          endColumn: 17,
          fix: { range: [6, 28], text: '' },
        };
        const expectedMessage = {
          ...mockError,
          line: 3,
          column: 29,
          endLine: 4,
          fix: { range: [53, 75], text: '' },
        };

        expect(
          processors['extract-inline-html'].postprocess(
            [[], [mockError]],
            'test.component.ts',
          ),
        ).toEqual([expectedMessage]);
      });
    });
  });
});

describe('createProcessor', () => {
  const processor = createProcessor({
    inlineStyles: { inlineStyleLanguage: 'css' },
  });

  it('returns the legacy processor for all templates-only options', () => {
    for (const options of [
      undefined,
      {},
      { inlineTemplates: true },
      { inlineStyles: false },
    ] as const) {
      expect(createProcessor(options)).toBe(processors['extract-inline-html']);
    }
    expect(createProcessor().meta.name).toBe('extract-inline-html');
  });

  it.each(['css', 'scss', 'sass', 'less'] as const)(
    'reuses instances and separates cache identities for %s',
    (inlineStyleLanguage) => {
      const options = { inlineStyles: { inlineStyleLanguage } };
      const combined = createProcessor(options);
      const stylesOnly = createProcessor({
        ...options,
        inlineTemplates: false,
      });
      expect(createProcessor({ ...options, inlineTemplates: true })).toBe(
        combined,
      );
      expect(createProcessor({ ...options, inlineTemplates: false })).toBe(
        stylesOnly,
      );
      expect(combined.meta.name).toBe(
        `extract-inline[templates,styles=${inlineStyleLanguage}]`,
      );
      expect(stylesOnly.meta.name).toBe(
        `extract-inline[styles=${inlineStyleLanguage}]`,
      );
      expect(stylesOnly).not.toBe(combined);
      const input =
        'import { Component } from "@angular/core"; @Component({ styles: "a{}", template: \'<div style="margin:0"></div>\' }) class Example {}';
      expect(stylesOnly.preprocess(input, 'only.component.ts')).toEqual([
        input,
        {
          text: 'a{}',
          filename: `inline-style-only.component.ts-1.${inlineStyleLanguage}`,
        },
        {
          text: 'a{margin:0}',
          filename: 'attribute-style-only.component.ts-2.css',
        },
      ]);
      expect(
        stylesOnly.preprocess('<div style="margin:0"></div>', 'only.html'),
      ).toEqual(
        combined.preprocess('<div style="margin:0"></div>', 'only.html'),
      );
    },
  );

  it.each([{}, true, null, 'css'])(
    'rejects invalid inlineStyles %j at runtime',
    (inlineStyles) => {
      expect(() =>
        createProcessor({ inlineStyles } as ProcessorOptions),
      ).toThrow(
        "inlineStyles requires inlineStyleLanguage (copy it from angular.json; Angular's default is 'css')",
      );
    },
  );

  it('rejects both features disabled and non-boolean inlineTemplates', () => {
    expect(() =>
      createProcessor({ inlineTemplates: false, inlineStyles: false }),
    ).toThrow(/both be disabled/);
    expect(() =>
      createProcessor({
        inlineTemplates: 'false',
      } as unknown as ProcessorOptions),
    ).toThrow(/must be a boolean/);
  });

  function createStyleLinter(
    tsProcessor: unknown,
    htmlProcessor?: unknown,
    replacement?: string,
    fix = false,
  ) {
    const parser: Linter.Parser = {
      parse: () => ({
        type: 'Program',
        body: [],
        sourceType: 'module',
        range: [0, 0],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        tokens: [],
        comments: [],
      }),
    };
    return new ESLint({
      fix,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          processor: tsProcessor as Linter.Processor,
          languageOptions: { parser },
        },
        {
          files: ['**/*.html'],
          ...(htmlProcessor
            ? { processor: htmlProcessor as Linter.Processor }
            : {}),
          languageOptions: { parser },
        },
        {
          files: ['**/*.css'],
          languageOptions: { parser },
          plugins: {
            test: {
              rules: {
                style: {
                  meta: { schema: [], fixable: 'code', hasSuggestions: true },
                  create(context) {
                    return {
                      Program() {
                        if (
                          'text' in context.sourceCode &&
                          context.sourceCode.text.includes('margin')
                        ) {
                          context.report({
                            loc: { line: 1, column: 2 },
                            message: 'Style diagnostic',
                            ...(replacement === undefined
                              ? {}
                              : {
                                  fix: () => ({
                                    range: [2, 10] as [number, number],
                                    text: replacement,
                                  }),
                                  suggest: [
                                    {
                                      desc: 'Replace declaration',
                                      fix: () => ({
                                        range: [2, 10] as [number, number],
                                        text: replacement,
                                      }),
                                    },
                                  ],
                                }),
                          });
                        }
                      },
                    };
                  },
                },
              },
            },
          },
          rules: { 'test/style': 'error' },
        },
      ],
    });
  }

  it.each([
    [
      false,
      `import { Component } from '@angular/core'; @Component({ template: '<div style="margin:0"></div>' }) class Example {}`,
    ],
    [
      true,
      `import { Component } from '@angular/core'; @Component({ template: '<div style="margin:0"></div>' }) class Example {}`,
    ],
  ])(
    'reports inline attributes once with HTML processing enabled: %s (%s)',
    async (processHtml, input) => {
      const eslint = createStyleLinter(
        processor,
        processHtml ? processor : undefined,
      );
      const [result] = await eslint.lintText(input, {
        filePath: 'example.component.ts',
      });

      expect(result.messages).toEqual([
        expect.objectContaining({
          ruleId: 'test/style',
          message: 'Style diagnostic',
          line: 1,
          column: input.indexOf('margin') + 1,
        }),
      ]);
    },
  );

  it('preserves inline attribute fixes when both TS and HTML use the processor', async () => {
    const input =
      'import { Component } from "@angular/core"; @Component({ template: `<div style="margin:0"></div>` }) class Example {}';
    const eslint = createStyleLinter(processor, processor, 'padding:0', true);
    const [result] = await eslint.lintText(input, {
      filePath: 'fixed.component.ts',
    });

    expect(result.output).toBe(input.replace('margin:0', 'padding:0'));
    expect(result.messages).toEqual([]);
  });

  it('preserves inline attribute suggestions when both TS and HTML use the processor', async () => {
    const input =
      'import { Component } from "@angular/core"; @Component({ template: `<div style="margin:0"></div>` }) class Example {}';
    const [result] = await createStyleLinter(
      processor,
      processor,
      'padding:0',
    ).lintText(input, { filePath: 'suggestion.component.ts' });
    const start = input.indexOf('margin');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].suggestions).toEqual([
      expect.objectContaining({
        fix: { range: [start, start + 8], text: 'padding:0' },
      }),
    ]);
  });

  it('skips entire TypeScript-substituted templates, including static attribute neighbors', async () => {
    const input =
      'import { Component } from "@angular/core"; @Component({ template: `<div style="margin:${width}px"></div><div style="margin:0"></div>` }) class Example {}';
    const [result] = await createStyleLinter(processor, processor).lintText(
      input,
      {
        filePath: 'dynamic.component.ts',
      },
    );

    expect(result.messages).toEqual([]);
  });

  it.each([
    'inline-template-example.component.ts-1.component.html',
    'example.component.ts/1_inline-template-example.component.ts-1.component.html',
  ])(
    'passes through our generated template block %s without nested extraction',
    (filename) => {
      const input = '<div style="margin:0"></div>';
      expect(processor.preprocess(input, filename)).toEqual([input]);
    },
  );

  it.each([
    ['a{content:"$ {color}"}', ' ', 1, ''],
    ['a{content:"$color}"}', 'color', 0, '{'],
    ['a{content:"{color}"}', '{color', 0, '$'],
  ])(
    'rejects boundary interpolation edits in %s',
    (css, target, length, text) => {
      const input =
        'import { Component } from "@angular/core"; @Component({ styles: `' +
        css +
        '` }) class Example {}';
      processor.preprocess(input, 'boundary.component.ts');
      const offset = css.indexOf(target);
      const edit = {
        range: [offset, offset + length] as [number, number],
        text,
      };
      const diagnostic = {
        ...styleMessage(
          {
            line: 1,
            column: offset + 1,
            endLine: 1,
            endColumn: offset + length + 1,
          },
          edit,
        ),
        suggestions: [{ desc: 'Change declaration', fix: edit }],
      };
      const [message] = processor.postprocess(
        [[], [diagnostic]],
        'boundary.component.ts',
      );

      expect(message).toMatchObject({ fix: undefined, suggestions: [] });
    },
  );

  it('reports inline attributes once when TS and HTML use differently configured instances', async () => {
    const input = `import { Component } from '@angular/core'; @Component({ template: '<div style="margin:0"></div>' }) class Example {}`;
    const eslint = createStyleLinter(
      createProcessor({ inlineStyles: { inlineStyleLanguage: 'scss' } }),
      processor,
    );
    const [result] = await eslint.lintText(input, {
      filePath: 'example.component.ts',
    });

    expect(result.messages).toEqual([
      expect.objectContaining({
        ruleId: 'test/style',
        column: input.indexOf('margin') + 1,
      }),
    ]);
  });

  it('does not parse TypeScript files that are unlikely to contain components', () => {
    const createSourceFile = vi.mocked(ts.createSourceFile);
    createSourceFile.mockClear();
    const util = 'export const styles = "a { margin-left: 0; }";';
    expect(processor.preprocess(util, 'util.ts')).toEqual([util]);
    expect(createSourceFile).not.toHaveBeenCalled();

    const component = `import { Component } from '@angular/core';\n@Component({ template: '<div></div>', styles: 'a {}' }) class Example {}`;
    processor.preprocess(component, 'example.component.ts');
    expect(createSourceFile).toHaveBeenCalledTimes(1);
    expect(createSourceFile.mock.calls[0][0]).toBe('example.component.ts');
    processor.preprocess('<div style="margin:0"></div>', 'example.html');
    expect(createSourceFile).toHaveBeenCalledTimes(1);
  });

  it('retains the HTML block if extracting attributes unexpectedly throws', () => {
    const input = '<div style="margin:0"></div>';
    const parse = vi
      .spyOn(HtmlParser.prototype, 'parse')
      .mockImplementationOnce(() => {
        throw new Error('Unexpected extraction failure');
      });
    try {
      expect(processor.preprocess(input, 'failed.html')).toEqual([input]);
      const message = styleMessage({
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 2,
      });
      expect(processor.postprocess([[message]], 'failed.html')).toEqual([
        message,
      ]);
    } finally {
      parse.mockRestore();
    }
  });

  it.each([1, 2, 11])(
    'drops non-fatal wrapper reports starting at column %s',
    (column) => {
      processor.preprocess('<div style="margin:0"></div>', 'wrapper.html');
      const message = styleMessage({
        line: 1,
        column,
        endLine: 1,
        endColumn: column + 1,
      });
      expect(processor.postprocess([[], [message]], 'wrapper.html')).toEqual(
        [],
      );
    },
  );

  it.each([1, 2, 11])(
    'keeps fatal wrapper reports starting at column %s',
    (column) => {
      processor.preprocess('<div style="margin:0"></div>', 'fatal.html');
      const message = {
        ...styleMessage({ line: 1, column, endLine: 1, endColumn: column + 1 }),
        fatal: true,
      };
      expect(processor.postprocess([[], [message]], 'fatal.html')).toEqual([
        expect.objectContaining({ fatal: true, message: 'test' }),
      ]);
    },
  );

  it.each(['\n', '\r\n', '\r', '\u2028', '\u2029'])(
    'maps multiline diagnostics, fixes and suggestions with %j line endings',
    (newline) => {
      const input =
        '@Component({' +
        newline +
        'styles: `a {' +
        newline +
        '  margin:0;' +
        newline +
        '}`' +
        newline +
        '}) class Example {}';
      processor.preprocess(input, 'lines.component.ts');
      const start = input.indexOf('margin');
      const edit = { range: [6, 14] as [number, number], text: 'padding:0' };
      const diagnostic = {
        ...styleMessage(
          { line: 2, column: 3, endLine: 2, endColumn: 11 },
          edit,
        ),
        suggestions: [{ desc: 'Replace declaration', fix: edit }],
      };
      expect(
        processor.postprocess([[], [diagnostic]], 'lines.component.ts'),
      ).toEqual([
        expect.objectContaining({
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 11,
          fix: { range: [start, start + 8], text: 'padding:0' },
          suggestions: [
            {
              desc: 'Replace declaration',
              fix: { range: [start, start + 8], text: 'padding:0' },
            },
          ],
        }),
      ]);
    },
  );

  it('rejects whitespace fixes and suggestions in unquoted style attributes', () => {
    const input = '<div style=margin:0></div>';
    processor.preprocess(input, 'example.html');
    const fix = { range: [2, 10], text: 'margin: 0' };
    const message = {
      ruleId: 'test',
      severity: 2,
      message: 'format',
      line: 1,
      column: 3,
      endLine: 1,
      endColumn: 11,
      nodeType: 'Declaration',
      messageId: 'format',
      fix,
      suggestions: [{ desc: 'Format declaration', fix }],
    };

    expect(processor.postprocess([[], [message]], 'example.html')).toEqual([
      expect.objectContaining({ fix: undefined, suggestions: [] }),
    ]);
  });

  it.each([
    ['<div style="margin:0"></div>', 'margin: 0'],
    ["<div style='margin:0'></div>", 'margin: 0'],
    ['<div style=margin:0></div>', 'margin:1'],
  ])('preserves safe style fixes for %s', (input, replacement) => {
    processor.preprocess(input, 'safe.html');
    const start = input.indexOf('margin');
    expect(
      processor.postprocess(
        [
          [],
          [
            {
              ruleId: 'test',
              severity: 2,
              message: 'format',
              line: 1,
              column: 3,
              endLine: 1,
              endColumn: 11,
              nodeType: 'Declaration',
              messageId: 'format',
              fix: { range: [2, 10], text: replacement },
            },
          ],
        ],
        'safe.html',
      ),
    ).toEqual([
      expect.objectContaining({
        fix: { range: [start, start + 'margin:0'.length], text: replacement },
      }),
    ]);
  });

  it('extracts component styles, inline template attributes, and preserves template extraction', () => {
    const input = `
      import { Component } from '@angular/core';

      @Component({
        styles: ['a { margin-left: 0; }', 'a { padding-right: 0; }'],
        template: \
          \`<div style="width: 1px; margin-left: 0;"></div>\`,
      })
      export class ExampleComponent {}
    `;

    expect(processor.preprocess(input, 'example.component.ts')).toEqual([
      input,
      {
        filename: 'inline-template-example.component.ts-1.component.html',
        text: '<div style="width: 1px; margin-left: 0;"></div>',
      },
      {
        filename: 'inline-style-example.component.ts-1.css',
        text: 'a { margin-left: 0; }',
      },
      {
        filename: 'inline-style-example.component.ts-2.css',
        text: 'a { padding-right: 0; }',
      },
      {
        filename: 'attribute-style-example.component.ts-3.css',
        text: 'a{width: 1px; margin-left: 0;}',
      },
    ]);
  });

  it('emits component styles in the configured inlineStyleLanguage and attributes as CSS', () => {
    const input = `import { Component } from '@angular/core';\n@Component({ styles: 'a { $x: 1px; }', template: '<div style="margin: 0"></div>' }) class Example {}`;
    const scss = createProcessor({
      inlineStyles: { inlineStyleLanguage: 'scss' },
    });

    expect(scss.meta.name).toBe('extract-inline[templates,styles=scss]');
    expect(processor.meta.name).toBe('extract-inline[templates,styles=css]');
    expect(scss.preprocess(input, 'example.component.ts')).toEqual([
      input,
      expect.objectContaining({
        filename: 'inline-template-example.component.ts-1.component.html',
      }),
      {
        filename: 'inline-style-example.component.ts-1.scss',
        text: 'a { $x: 1px; }',
      },
      {
        filename: 'attribute-style-example.component.ts-2.css',
        text: 'a{margin: 0}',
      },
    ]);
    expect(
      createProcessor({
        inlineStyles: { inlineStyleLanguage: 'less' },
      }).preprocess(input, 'example.component.ts')[2],
    ).toEqual(
      expect.objectContaining({
        filename: 'inline-style-example.component.ts-1.less',
      }),
    );
  });

  it.each(['css', 'scss', 'sass', 'less'] as const)(
    'rejects a non-string language after warming the %s cache',
    (inlineStyleLanguage) => {
      createProcessor({ inlineStyles: { inlineStyleLanguage } });
      expect(() =>
        createProcessor({
          inlineStyles: { inlineStyleLanguage: [inlineStyleLanguage] },
        } as unknown as ProcessorOptions),
      ).toThrow(/unsupported inlineStyleLanguage/);
    },
  );

  it('rejects unsupported inlineStyleLanguage values', () => {
    expect(() =>
      createProcessor({
        inlineStyles: { inlineStyleLanguage: 'stylus' as 'css' },
      }),
    ).toThrow(/unsupported inlineStyleLanguage "stylus"/);
  });

  it('skips style attributes containing interpolations', () => {
    const input =
      '<div style="color: {{ c }}"></div><div style="{{ dynamicStyles }}"></div><div style="{{ prop }}: 1px"></div><div style="margin: 0"></div>';

    expect(processor.preprocess(input, 'example.component.html')).toEqual([
      input,
      {
        filename: 'attribute-style-example.component.html-1.css',
        text: 'a{margin: 0}',
      },
    ]);
  });

  it('extracts style attributes from external templates', () => {
    const input = '<div style="margin-left: 0;"></div>';

    expect(processor.preprocess(input, 'example.component.html')).toEqual([
      input,
      {
        filename: 'attribute-style-example.component.html-1.css',
        text: 'a{margin-left: 0;}',
      },
    ]);
  });

  it.each([
    `import { Component as NgComponent } from '@angular/core';\n@NgComponent({ styles: 'a { margin-left: 0; }' }) class Example {}`,
    `import * as ng from '@angular/core';\n@ng.Component({ styles: 'a { margin-left: 0; }' }) class Example {}`,
  ])(
    'leaves alias and namespace component detection unsupported for both features',
    (input) => {
      expect(processor.preprocess(input, 'example.component.ts')).toEqual([
        input,
      ]);
      expect(
        createProcessor().preprocess(input, 'example.component.ts'),
      ).toEqual([input]);
    },
  );

  it.each([
    `import { Component } from './angular';\n@Component({ styles: 'a { margin-left: 0; }', template: '<div></div>' }) class Example {}`,
    `@Component({ styles: 'a { margin-left: 0; }', template: '<div></div>' }) class Example {}`,
  ])(
    'uses the same Component decorator metadata for templates and styles',
    (input) => {
      expect(processor.preprocess(input, 'example.component.ts')).toEqual([
        input,
        {
          filename: 'inline-template-example.component.ts-1.component.html',
          text: '<div></div>',
        },
        {
          filename: 'inline-style-example.component.ts-1.css',
          text: 'a { margin-left: 0; }',
        },
      ]);
    },
  );

  it('skips dynamic styles and non-Angular objects', () => {
    const dynamic = `
      import { Component } from '@angular/core';
      const sharedStyles = 'a { margin-left: 0; }';
      @Component({ styles: [sharedStyles, \`a { color: \${color}; }\`] })
      class Example {}
    `;
    const object = `const object = { styles: 'a { margin-left: 0; }' };`;

    expect(processor.preprocess(dynamic, 'example.component.ts')).toEqual([
      dynamic,
    ]);
    expect(processor.preprocess(object, 'example.component.ts')).toEqual([
      object,
    ]);
  });

  it('maps style diagnostics and fixes to the original source', () => {
    const input = `
      import { Component } from '@angular/core';
      @Component({ styles: 'a { margin-left: 0; }' })
      class Example {}
    `;
    processor.preprocess(input, 'example.component.ts');
    const start = input.indexOf('margin-left');

    expect(
      processor.postprocess(
        [
          [],
          [
            {
              ruleId: 'test',
              severity: 2,
              message: 'test',
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 16,
              nodeType: 'Declaration',
              messageId: 'test',
              fix: { range: [4, 15], text: 'margin-inline-start' },
            },
          ],
        ],
        'example.component.ts',
      ),
    ).toEqual([
      expect.objectContaining({
        line: 3,
        column: start - input.lastIndexOf('\n', start - 1),
        fix: {
          range: [start, start + 'margin-left'.length],
          text: 'margin-inline-start',
        },
      }),
    ]);
  });

  function styleMessage(
    location: {
      line: number;
      column: number;
      endLine: number;
      endColumn: number;
    },
    fix?: { range: [number, number]; text: string },
  ) {
    return {
      ruleId: 'test',
      severity: 2,
      message: 'test',
      nodeType: 'Declaration',
      messageId: 'test',
      ...location,
      ...(fix ? { fix } : {}),
    };
  }

  function columnOf(input: string, offset: number) {
    return offset - input.lastIndexOf('\n', offset - 1);
  }

  it.each(['margin:\\x30', 'margin:\\u0030', 'margin:\\u{30}'])(
    'maps escaped component declarations without unsafe fixes: %s',
    (declaration) => {
      const input = `@Component({ styles: 'a{${declaration}}' }) class Example {}`;
      expect(processor.preprocess(input, 'escaped.component.ts')).toEqual([
        input,
        {
          filename: 'inline-style-escaped.component.ts-1.css',
          text: 'a{margin:0}',
        },
      ]);
      const edit = { range: [2, 10] as [number, number], text: 'padding:0' };
      const message = {
        ...styleMessage(
          { line: 1, column: 3, endLine: 1, endColumn: 11 },
          edit,
        ),
        suggestions: [{ desc: 'Replace declaration', fix: edit }],
      };
      expect(
        processor.postprocess([[], [message]], 'escaped.component.ts'),
      ).toEqual([
        expect.objectContaining({
          column: input.indexOf('margin') + 1,
          endColumn: input.indexOf("}'") + 1,
          fix: undefined,
          suggestions: [],
        }),
      ]);
    },
  );

  it.each(['margin&#58;0', 'margin:&#48;', 'margin:&#x30;'])(
    'maps entity-encoded attributes inside control-flow blocks: %s',
    (declaration) => {
      const input = `@if (visible) { <div style="${declaration}"></div> }`;
      expect(processor.preprocess(input, 'entities.html')).toEqual([
        input,
        {
          filename: 'attribute-style-entities.html-1.css',
          text: 'a{margin:0}',
        },
      ]);
      const edit = { range: [2, 10] as [number, number], text: 'padding:0' };
      const message = {
        ...styleMessage(
          { line: 1, column: 3, endLine: 1, endColumn: 11 },
          edit,
        ),
        suggestions: [{ desc: 'Replace declaration', fix: edit }],
      };
      expect(processor.postprocess([[], [message]], 'entities.html')).toEqual([
        expect.objectContaining({
          column: input.indexOf('margin') + 1,
          endColumn: input.indexOf('"></div>') + 1,
          fix: undefined,
          suggestions: [],
        }),
      ]);
    },
  );

  it('maps external HTML CRLF locations, fixes, and suggestions', () => {
    const input = '<div\r\n style="margin:\r\n 0"></div>';
    expect(processor.preprocess(input, 'lines.html')).toEqual([
      input,
      { filename: 'attribute-style-lines.html-1.css', text: 'a{margin:\n 0}' },
    ]);
    const edit = { range: [11, 12] as [number, number], text: '1' };
    const message = {
      ...styleMessage({ line: 2, column: 2, endLine: 2, endColumn: 3 }, edit),
      suggestions: [{ desc: 'Replace value', fix: edit }],
    };
    const start = input.indexOf('0');
    expect(processor.postprocess([[], [message]], 'lines.html')).toEqual([
      expect.objectContaining({
        line: 3,
        column: 2,
        endLine: 3,
        endColumn: 3,
        fix: { range: [start, start + 1], text: '1' },
        suggestions: [
          {
            desc: 'Replace value',
            fix: { range: [start, start + 1], text: '1' },
          },
        ],
      }),
    ]);
  });

  it('keeps style mappings separate for multiple components in one file', () => {
    const input =
      '@Component({ styles: "a{margin:0}" }) class First {}\n@Component({ styles: "a{margin:1}" }) class Second {}';
    processor.preprocess(input, 'multiple.component.ts');
    const message = styleMessage({
      line: 1,
      column: 3,
      endLine: 1,
      endColumn: 9,
    });
    expect(
      processor.postprocess(
        [[], [{ ...message }], [{ ...message }]],
        'multiple.component.ts',
      ),
    ).toEqual([
      expect.objectContaining({
        line: 1,
        column: columnOf(input, input.indexOf('margin:0')),
      }),
      expect.objectContaining({
        line: 2,
        column: columnOf(input, input.indexOf('margin:1')),
      }),
    ]);
  });

  it('falls back to the style literal bounds for locations outside the virtual file', () => {
    const input = `import { Component } from '@angular/core';\n@Component({ styles: 'a { color: red; }' })\nclass Example {}`;
    processor.preprocess(input, 'example.component.ts');
    const contentStart = input.indexOf("'a {") + 1;
    const contentEnd = input.indexOf("' })");

    expect(
      processor.postprocess(
        [
          [],
          [styleMessage({ line: 10, column: 1, endLine: 10, endColumn: 99 })],
        ],
        'example.component.ts',
      ),
    ).toEqual([
      expect.objectContaining({
        line: 2,
        column: columnOf(input, contentStart),
        endLine: 2,
        endColumn: columnOf(input, contentEnd),
      }),
    ]);
  });

  it.each([
    ['`', 'x\n"y"\'z\'', true],
    ['`', 'x`', false],
    ['`', '${x}', false],
    ['`', 'x\\y', false],
    ["'", 'x"y"', true],
    ["'", "x'y", false],
    ["'", 'x\ny', false],
    ['"', "x'y'", true],
    ['"', 'x"y', false],
  ])(
    'only keeps component style fixes that are safe inside a %s literal (%j allowed: %s)',
    (quote, text, allowed) => {
      const input = `import { Component } from '@angular/core';\n@Component({ styles: ${quote}a { color: red; }${quote} })\nclass Example {}`;
      processor.preprocess(input, 'example.component.ts');
      const start = input.indexOf('color');

      const [message] = processor.postprocess(
        [
          [],
          [
            styleMessage(
              { line: 1, column: 5, endLine: 1, endColumn: 10 },
              { range: [4, 9], text },
            ),
          ],
        ],
        'example.component.ts',
      );

      expect(message).toEqual(
        expect.objectContaining({
          fix: allowed ? { range: [start, start + 5], text } : undefined,
        }),
      );
    },
  );

  it.each([
    ["'", "x'y", false],
    ["'", 'x"y', false],
    ["'", 'x\ny', false],
    ['`', "x'y\nz", true],
    ['`', 'x"y', false],
    ['`', 'x&y', false],
  ])(
    'only keeps template attribute fixes that are safe inside a %s literal and the attribute quotes (%j allowed: %s)',
    (quote, text, allowed) => {
      const input = `import { Component } from '@angular/core';\n@Component({ template: ${quote}<div style="color: red"></div>${quote} })\nclass Example {}`;
      processor.preprocess(input, 'example.component.ts');
      const start = input.indexOf('color');

      const [message] = processor.postprocess(
        [
          [],
          [],
          [
            styleMessage(
              { line: 1, column: 3, endLine: 1, endColumn: 8 },
              { range: [2, 7], text },
            ),
          ],
        ],
        'example.component.ts',
      );

      expect(message).toEqual(
        expect.objectContaining({
          fix: allowed ? { range: [start, start + 5], text } : undefined,
        }),
      );
    },
  );
});
