import * as templateParser from '@angular-eslint/template-parser';
import { ESLint, type Linter } from 'eslint';
import { HtmlParser } from '@angular-eslint/bundled-angular-compiler';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import processors, {
  createProcessor,
  type ProcessorOptions,
  isFileLikelyToContainComponentDeclarations,
} from '../src/processors';
import {
  decodeLiteralText,
  escapeStringLiteralText,
  mapStringLiteralEdit,
  scanStringLiteral,
  sourceOffsetAt,
} from '../src/literal-text';
import attributesOrder from '../src/rules/attributes-order';
import bananaInBox from '../src/rules/banana-in-box';
import eqeqeq from '../src/rules/eqeqeq';
import noMultiTokenClassKey from '../src/rules/no-multi-token-class-key';
import preferSelfClosingTags from '../src/rules/prefer-self-closing-tags';

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

      it('should adjust the fix ranges of suggestions from the inline templates', () => {
        const fileContent = `
          @Component({
            template: '<div>{{ a == b }}</div>',
          })
          export class Component {
            a = 1;
            b = 2;
          }
        `;
        processors['extract-inline-html'].preprocess(
          fileContent,
          'test.component.ts',
        );
        const mockError = {
          ruleId: 'eqeqeq',
          severity: 2,
          message: 'Expected `===` but received `==`',
          line: 1,
          column: 9,
          nodeType: 'Binary',
          messageId: 'eqeqeq',
          endLine: 1,
          endColumn: 15,
          suggestions: [
            {
              messageId: 'suggestStrictEquality',
              desc: 'Replace `==` with `===`',
              fix: { range: [11, 11], text: '=' },
            },
          ],
        };
        const expectedMessage = {
          ...mockError,
          line: 3,
          column: 32,
          endLine: 3,
          endColumn: 38,
          suggestions: [
            {
              messageId: 'suggestStrictEquality',
              desc: 'Replace `==` with `===`',
              fix: { range: [58, 58], text: '=' },
            },
          ],
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

  it('adjusts the fix ranges of suggestions from inline templates', () => {
    const fileContent = `
      @Component({
        template: '<div>{{ a == b }}</div>',
      })
      export class Component {}
    `;
    processor.preprocess(fileContent, 'suggestion-template.component.ts');
    const suggestion = {
      messageId: 'suggestStrictEquality',
      desc: 'Replace `==` with `===`',
      fix: { range: [11, 11], text: '=' },
    };
    const mockError = {
      ruleId: 'eqeqeq',
      severity: 2,
      message: 'Expected `===` but received `==`',
      line: 1,
      column: 9,
      nodeType: 'Binary',
      messageId: 'eqeqeq',
      endLine: 1,
      endColumn: 15,
      suggestions: [suggestion],
    };
    const start = fileContent.indexOf('<div>') + 11;

    expect(
      processor.postprocess(
        [[], [mockError]],
        'suggestion-template.component.ts',
      ),
    ).toEqual([
      expect.objectContaining({
        suggestions: [
          { ...suggestion, fix: { range: [start, start], text: '=' } },
        ],
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

describe('extract-inline-html with escape sequences in inline templates', () => {
  const processor = processors['extract-inline-html'];

  const tsParser: Linter.Parser = {
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

  const rules = {
    'attributes-order': attributesOrder,
    'banana-in-box': bananaInBox,
    eqeqeq,
    'no-multi-token-class-key': noMultiTokenClassKey,
    'prefer-self-closing-tags': preferSelfClosingTags,
  };
  type RuleName = keyof typeof rules;

  function createTemplateLinter(rule: RuleName | RuleName[], fix = false) {
    const htmlConfig: Linter.Config = {
      files: ['**/*.html'],
      languageOptions: { parser: templateParser },
      plugins: { template: { rules } as unknown as ESLint.Plugin },
      rules: Object.fromEntries(
        [rule].flat().map((name) => [`template/${name}`, 'error']),
      ),
    };
    return new ESLint({
      fix,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          processor: processor as Linter.Processor,
          languageOptions: { parser: tsParser },
        },
        htmlConfig,
      ],
    });
  }

  function component(template: string) {
    return `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-example',\n  template: ${template},\n})\nexport class ExampleComponent {}\n`;
  }

  /** Converts an ESLint line and column to an offset, honouring CRLF */
  function offsetOf(text: string, line: number, column: number) {
    let offset = 0;
    for (let current = 1; current < line; current++) {
      offset = text.indexOf('\n', offset) + 1;
    }
    return offset + column - 1;
  }

  function reportedText(text: string, message: Linter.LintMessage) {
    return text.slice(
      offsetOf(text, message.line, message.column),
      offsetOf(text, message.endLine ?? 0, message.endColumn ?? 0),
    );
  }

  /**
   * Asserts that the file still parses, and returns the value of the template
   * (empty if it is a template literal with substitutions, which has none)
   */
  function templateValue(text: string) {
    const sourceFile = ts.createSourceFile(
      'example.component.ts',
      text,
      ts.ScriptTarget.Latest,
      true,
    );
    expect(
      (sourceFile as unknown as { parseDiagnostics: unknown[] })
        .parseDiagnostics,
    ).toEqual([]);
    let value: string | undefined;
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node) &&
        node.name.getText(sourceFile) === 'template' &&
        ts.isStringLiteralLike(node.initializer)
      ) {
        value = node.initializer.text;
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return value ?? '';
  }

  function applySuggestion(text: string, message: Linter.LintMessage) {
    const fixes = message.suggestions?.map((suggestion) => suggestion.fix);
    expect(fixes).toHaveLength(1);
    const [{ range, text: replacement }] = fixes ?? [];
    return text.slice(0, range[0]) + replacement + text.slice(range[1]);
  }

  /**
   * Lints the decoded template directly as an HTML file, which is what the
   * fix inside the TypeScript file has to be equivalent to
   */
  async function lintDecodedTemplate(
    rule: RuleName | RuleName[],
    template: string,
  ) {
    const [linted] = await createTemplateLinter(rule).lintText(template, {
      filePath: 'example.component.html',
    });
    const [fixed] = await createTemplateLinter(rule, true).lintText(template, {
      filePath: 'example.component.html',
    });
    return { messages: linted.messages, output: fixed.output ?? template };
  }

  describe('fixes', () => {
    it.each<[string, RuleName, string, string, string]>([
      [
        'single quotes, escapes before the fix',
        'banana-in-box',
        String.raw`'<p title="it\'s \\ \x41\u0042\u{43}">\"a\"\nb\
c</p><div ([ngModel])="v"></div>'`,
        String.raw`'<p title="it\'s \\ \x41\u0042\u{43}">\"a\"\nb\
c</p><div [(ngModel)]="v"></div>'`,
        '([ngModel])="v"',
      ],
      [
        'single quotes, escapes after the fix',
        'banana-in-box',
        String.raw`'<div ([ngModel])="v"></div><p title="it\'s \\ \x41\u0042\u{43}">\"a\"\nb\
c</p>'`,
        String.raw`'<div [(ngModel)]="v"></div><p title="it\'s \\ \x41\u0042\u{43}">\"a\"\nb\
c</p>'`,
        '([ngModel])="v"',
      ],
      [
        'single quotes, escapes inside the fix',
        'attributes-order',
        String.raw`'<p>it\'s</p><input [value]="v" id="it\'s \\ \x41\u0042\u{43}" type="text" /><p>\'</p>'`,
        String.raw`'<p>it\'s</p><input id="it\'s \\ ABC" type="text" [value]="v" /><p>\'</p>'`,
        String.raw`[value]="v" id="it\'s \\ \x41\u0042\u{43}" type="text"`,
      ],
      [
        'double quotes, escapes before the fix',
        'banana-in-box',
        String.raw`"<p title=\"it's \\ \x41\u0042\u{43}\">'a'\nb\
c</p><div ([ngModel])=\"v\"></div>"`,
        String.raw`"<p title=\"it's \\ \x41\u0042\u{43}\">'a'\nb\
c</p><div [(ngModel)]=\"v\"></div>"`,
        String.raw`([ngModel])=\"v\"`,
      ],
      [
        'double quotes, escapes after the fix',
        'banana-in-box',
        String.raw`"<div ([ngModel])=\"v\"></div><p title=\"it's \\ \x41\u0042\u{43}\">'a'\nb\
c</p>"`,
        String.raw`"<div [(ngModel)]=\"v\"></div><p title=\"it's \\ \x41\u0042\u{43}\">'a'\nb\
c</p>"`,
        String.raw`([ngModel])=\"v\"`,
      ],
      [
        'double quotes, escapes inside the fix',
        'attributes-order',
        String.raw`"<input [value]=\"v\" id='say \"hi\" \\ \x41\u0042\u{43}' type=\"text\" />"`,
        String.raw`"<input id='say \"hi\" \\ ABC' type=\"text\" [value]=\"v\" />"`,
        String.raw`[value]=\"v\" id='say \"hi\" \\ \x41\u0042\u{43}' type=\"text\"`,
      ],
      [
        'single quotes, a CRLF line continuation before the fix',
        'banana-in-box',
        `'<p>a\\\r\nb</p><div ([ngModel])="v"></div>'`,
        `'<p>a\\\r\nb</p><div [(ngModel)]="v"></div>'`,
        '([ngModel])="v"',
      ],
      [
        'single quotes, newline escapes and line continuations before a fix on a later line',
        'prefer-self-closing-tags',
        String.raw`'<p>\n  it\'s\n</p>\
<app-x title="\u0041\\"></app-x>'`,
        String.raw`'<p>\n  it\'s\n</p>\
<app-x title="\u0041\\" />'`,
        '</app-x>',
      ],
      [
        'backticks, escapes before the fix',
        'banana-in-box',
        '`<p title="\\` \\${x} \\\\ \\x41\\u0042\\u{43}">\\na\\\nb</p><div ([ngModel])="v"></div>`',
        '`<p title="\\` \\${x} \\\\ \\x41\\u0042\\u{43}">\\na\\\nb</p><div [(ngModel)]="v"></div>`',
        '([ngModel])="v"',
      ],
      [
        'backticks, escapes after the fix',
        'banana-in-box',
        '`<div ([ngModel])="v"></div><p title="\\` \\${x} \\\\ \\x41\\u0042\\u{43}">\\na\\\nb</p>`',
        '`<div [(ngModel)]="v"></div><p title="\\` \\${x} \\\\ \\x41\\u0042\\u{43}">\\na\\\nb</p>`',
        '([ngModel])="v"',
      ],
      [
        'backticks, escapes inside the fix',
        'attributes-order',
        '`<input [value]="v" id="\\` \\${x} \\\\ \\x41\\u0042\\u{43}\\n" type="text" />`',
        '`<input id="\\` \\${x} \\\\ \\x41\\u0042\\u{43}\\n" type="text" [value]="v" />`',
        '[value]="v" id="\\` \\${x} \\\\ \\x41\\u0042\\u{43}\\n" type="text"',
      ],
      [
        'backticks with a substitution inside the fix',
        'attributes-order',
        '`<input [value]="v" id="${1}" type="text" />`',
        '`<input id="${1}" type="text" [value]="v" />`',
        '[value]="v" id="${1}" type="text"',
      ],
      [
        'backticks without escapes, on a later line',
        'prefer-self-closing-tags',
        '`\n  <p>a</p>\n  <app-x title="b"></app-x>\n`',
        '`\n  <p>a</p>\n  <app-x title="b" />\n`',
        '</app-x>',
      ],
      // Angular only breaks lines at \n, unlike ESLint, and its lexer does not
      // count \r towards the column
      ...[
        ['a carriage return', '\\r'],
        ['a CRLF', '\\r\\n'],
        ['a line separator', '\\u2028'],
        ['a paragraph separator', '\\u2029'],
        ['carriage returns', '\\r\\r'],
      ].flatMap(
        ([name, escape]): [string, RuleName, string, string, string][] => [
          [
            `single quotes, ${name} escape before the fix`,
            'prefer-self-closing-tags',
            `'<p>${escape}X</p><app-x></app-x>'`,
            `'<p>${escape}X</p><app-x />'`,
            '</app-x>',
          ],
          [
            `single quotes, ${name} escape before the fix on a later line`,
            'prefer-self-closing-tags',
            `'<p>${escape}X</p>\\n<i>${escape}</i><app-x></app-x>'`,
            `'<p>${escape}X</p>\\n<i>${escape}</i><app-x />'`,
            '</app-x>',
          ],
        ],
      ),
    ])(
      '%s (%s)',
      async (_description, rule, template, fixedTemplate, expectedText) => {
        const input = component(template);
        const [linted] = await createTemplateLinter(rule).lintText(input, {
          filePath: 'example.component.ts',
        });
        expect(linted.messages).toHaveLength(1);
        expect(reportedText(input, linted.messages[0])).toBe(expectedText);

        const [fixed] = await createTemplateLinter(rule, true).lintText(input, {
          filePath: 'example.component.ts',
        });
        expect(fixed.output).toBe(component(fixedTemplate));
        const fixedValue = templateValue(fixed.output ?? '');

        // The fixed literal decodes to what fixing the template directly gives
        if (!template.startsWith('`')) {
          const decoded = await lintDecodedTemplate(rule, templateValue(input));
          expect(fixedValue).toBe(decoded.output);
        }
      },
    );
  });

  describe('suggestions', () => {
    it.each<[string, RuleName, string, string, string]>([
      [
        'single quotes',
        'no-multi-token-class-key',
        String.raw`'<p>it\'s\n\x41</p><div [class]="{ \'a b\': x }"></div><p>\\</p>'`,
        String.raw`'<p>it\'s\n\x41</p><div [class]="{ \'a\': x, \'b\': x }"></div><p>\\</p>'`,
        String.raw`\'a b\'`,
      ],
      [
        'double quotes',
        'no-multi-token-class-key',
        String.raw`"<p>\"\u0041\"\</p><div [class]=\"{ 'a b': x }\"></div>"`,
        String.raw`"<p>\"\u0041\"\</p><div [class]=\"{ 'a': x, 'b': x }\"></div>"`,
        `'a b'`,
      ],
      [
        'backticks',
        'no-multi-token-class-key',
        '`<p title="\\${x}">\\`\\\\</p><div [class]="{ \'a b\': x }"></div>`',
        '`<p title="\\${x}">\\`\\\\</p><div [class]="{ \'a\': x, \'b\': x }"></div>`',
        `'a b'`,
      ],
      [
        'single quotes, a multi-line template',
        'eqeqeq',
        String.raw`'<p title="\u0041\\">\n  {{ a == b }}\
</p>'`,
        String.raw`'<p title="\u0041\\">\n  {{ a === b }}\
</p>'`,
        'a == b',
      ],
      // ESLint breaks lines at these, and so do rules reporting locations
      // computed by ESLint
      ...['\\r', '\\u2028', '\\u2029'].map(
        (escape): [string, RuleName, string, string, string] => [
          `single quotes, a ${escape} escape on the same line`,
          'eqeqeq',
          `'<p>${escape}{{ a == b }}</p>'`,
          `'<p>${escape}{{ a === b }}</p>'`,
          'a == b',
        ],
      ),
    ])(
      '%s (%s)',
      async (_description, rule, template, suggestedTemplate, expectedText) => {
        const input = component(template);
        const [linted] = await createTemplateLinter(rule).lintText(input, {
          filePath: 'example.component.ts',
        });
        expect(linted.messages).toHaveLength(1);
        expect(reportedText(input, linted.messages[0])).toBe(expectedText);

        const suggested = applySuggestion(input, linted.messages[0]);
        expect(suggested).toBe(component(suggestedTemplate));
        const suggestedValue = templateValue(suggested);

        if (!template.startsWith('`')) {
          const decodedTemplate = templateValue(input);
          const decoded = await lintDecodedTemplate(rule, decodedTemplate);
          expect(suggestedValue).toBe(
            applySuggestion(decodedTemplate, decoded.messages[0]),
          );
        }
      },
    );
  });

  describe('edits that cannot be expressed in the literal', () => {
    function message(
      location: { line: number; column: number },
      fix: { range: [number, number]; text: string },
    ) {
      return {
        ruleId: 'test',
        severity: 2,
        message: 'test',
        nodeType: 'Element',
        messageId: 'test',
        ...location,
        endLine: location.line,
        endColumn: location.column + 1,
        fix,
        suggestions: [
          { desc: 'unsafe', fix },
          { desc: 'safe', fix: { range: [0, 0], text: 'x' } },
        ],
      };
    }

    it('drops edits that would split an escape sequence', () => {
      // \u{1F600} decodes to two UTF-16 code units
      const input = component(String.raw`'<p>\u{1F600}</p>'`);
      const [, template] = processor.preprocess(
        input,
        'example.component.ts',
      ) as [string, { text: string }];
      expect(template.text).toBe('<p>\u{1F600}</p>');

      const [mapped] = processor.postprocess(
        [[], [message({ line: 1, column: 4 }, { range: [4, 5], text: '' })]],
        'example.component.ts',
      );
      const start = input.indexOf('<p>');
      expect(mapped).toEqual(
        expect.objectContaining({
          line: 5,
          column: start - input.lastIndexOf('\n', start) + 3,
          suggestions: [
            { desc: 'safe', fix: { range: [start, start], text: 'x' } },
          ],
        }),
      );
      expect(mapped).not.toHaveProperty('fix');
    });

    it.each<[string, string, [number, number], string, string | undefined]>([
      // \0 followed by a digit would be a legacy octal escape
      [
        'joins \\0 with a following digit',
        String.raw`'<p>\0x1</p>'`,
        [4, 5],
        '',
        undefined,
      ],
      [
        'keeps \\0 apart from a following digit',
        String.raw`'<p>\0x1</p>'`,
        [4, 5],
        'y',
        'y',
      ],
      [
        'inserts a digit after a character after \\0',
        String.raw`'<p>\0x</p>'`,
        [5, 5],
        '1',
        '1',
      ],
      [
        'inserts a backslash before an escape sequence',
        String.raw`'<p>\x41</p>'`,
        [3, 3],
        '\\',
        '\\\\',
      ],
      [
        'replaces an escape sequence',
        String.raw`'<p>\x41\0</p>'`,
        [3, 4],
        '9',
        '9',
      ],
      [
        'replaces an escape sequence before \\0 with a digit',
        String.raw`'<p>\0\x41</p>'`,
        [4, 5],
        '9',
        undefined,
      ],
      ['deletes up to a line continuation', "'<p>a\\\nb</p>'", [3, 4], '', ''],
    ])(
      'checks the edit where it meets the literal: %s',
      (_description, template, range, text, expectedText) => {
        const input = component(template);
        processor.preprocess(input, 'example.component.ts');
        const [mapped] = processor.postprocess(
          [[], [message({ line: 1, column: 1 }, { range, text })]],
          'example.component.ts',
        ) as { fix?: { range: [number, number]; text: string } }[];

        if (expectedText === undefined) {
          expect(mapped).not.toHaveProperty('fix');
          return;
        }
        expect(mapped.fix?.text).toBe(expectedText);
        const [start, end] = mapped.fix?.range ?? [];
        const decodedValue = templateValue(input);
        expect(
          templateValue(
            input.slice(0, start) + expectedText + input.slice(end),
          ),
        ).toBe(
          decodedValue.slice(0, range[0]) + text + decodedValue.slice(range[1]),
        );
      },
    );

    it.each(["'", '"'])(
      'only maps edits that decode to the intended text, for every edit to a %s literal',
      (quote) => {
        // Padding keeps the escape sequences further apart than the context
        // that is re-read around each edit
        const padding = 'p'.repeat(20);
        const body = [
          String.raw`a\0b1`,
          String.raw`\x41\u{1F600}`,
          String.raw`\\\n${'\\' + quote}c\
d\u0030`,
        ].join(padding);
        const literalSource = `${quote}${body}${quote}`;
        const sourceFile = ts.createSourceFile(
          'example.ts',
          `x = ${literalSource};`,
          ts.ScriptTarget.Latest,
          true,
        );
        let literal: ts.StringLiteral | undefined;
        sourceFile.forEachChild(function visit(node) {
          if (ts.isStringLiteral(node)) {
            literal = node;
          }
          node.forEachChild(visit);
        });
        const decoded = decodeLiteralText(
          literal as ts.StringLiteral,
          sourceFile,
        );
        expect(decoded?.segments.length).toBeGreaterThan(0);
        if (!decoded) {
          return;
        }

        let mappedCount = 0;
        for (let start = 0; start <= decoded.text.length; start++) {
          for (let end = start; end <= decoded.text.length; end++) {
            for (const text of ['', '1', 'x', '\\', quote, '\n', '9a']) {
              const intended =
                decoded.text.slice(0, start) + text + decoded.text.slice(end);
              const mapped = mapStringLiteralEdit(decoded, sourceFile.text, {
                range: [start, end],
                text,
              });
              // Applying the edit to the whole literal is what has to decode correctly
              const whole = (range: [number, number], replacement: string) =>
                scanStringLiteral(
                  sourceFile.text.slice(literal?.getStart(), range[0]) +
                    replacement +
                    sourceFile.text.slice(range[1], literal?.end),
                );
              if (mapped) {
                mappedCount++;
                expect(whole(mapped.range, mapped.text)).toBe(intended);
              } else {
                // Only edits that would split an escape sequence, or change
                // how one is read, are dropped
                const from = sourceOffsetAt(decoded, start);
                const to = sourceOffsetAt(decoded, end);
                if (from.boundary && to.boundary) {
                  expect(
                    whole(
                      [from.offset, to.offset],
                      escapeStringLiteralText(text, quote),
                    ),
                  ).not.toBe(intended);
                }
              }
            }
          }
        }
        expect(mappedCount).toBeGreaterThan(0);
      },
    );

    it('drops edits that would change how a neighbouring escape sequence is read', () => {
      // Inserting a digit after \0 would turn it into a legacy octal escape
      const input = component(String.raw`'<p>\0</p>'`);
      processor.preprocess(input, 'example.component.ts');

      const [mapped] = processor.postprocess(
        [[], [message({ line: 1, column: 5 }, { range: [4, 4], text: '1' })]],
        'example.component.ts',
      );
      expect(mapped).not.toHaveProperty('fix');
      expect(mapped).toEqual(
        expect.objectContaining({
          suggestions: [expect.objectContaining({ desc: 'safe' })],
        }),
      );
    });

    it.each([
      ["'", String.raw`a\\b\'c"d\ne\rf\u2028g\u2029h`],
      ['"', String.raw`a\\b'c\"d\ne\rf\u2028g\u2029h`],
    ])(
      'escapes the replacement text for a %s literal',
      (quote, expectedText) => {
        const input = component(`${quote}<p></p>${quote}`);
        processor.preprocess(input, 'example.component.ts');

        const [mapped] = processor.postprocess(
          [
            [],
            [
              message(
                { line: 1, column: 4 },
                { range: [3, 3], text: 'a\\b\'c"d\ne\rf\u2028g\u2029h' },
              ),
            ],
          ],
          'example.component.ts',
        );
        const start = input.indexOf('<p>') + 3;
        expect(mapped).toEqual(
          expect.objectContaining({
            fix: { range: [start, start], text: expectedText },
          }),
        );
      },
    );

    it('maps messages without an end location', () => {
      const input = component(String.raw`'\n\n<p>\'</p>'`);
      processor.preprocess(input, 'example.component.ts');
      const start = input.indexOf('<p>');

      const [mapped] = processor.postprocess(
        [
          [],
          [
            {
              ruleId: null,
              fatal: true,
              severity: 2,
              message: 'Parsing error',
              line: 3,
              column: 4,
            } as unknown as ReturnType<typeof message>,
          ],
        ],
        'example.component.ts',
      );
      expect(mapped).toEqual({
        ruleId: null,
        fatal: true,
        severity: 2,
        message: 'Parsing error',
        line: 5,
        column: start - input.lastIndexOf('\n', start) + 3,
      });
    });
  });

  describe('template data', () => {
    const templateMessage = () => ({
      ruleId: 'test',
      severity: 2,
      message: 'test',
      nodeType: 'Element',
      messageId: 'test',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 2,
    });

    it('is released once the file has been postprocessed', () => {
      const input = component(String.raw`'<p>\'</p>'`);
      processor.preprocess(input, 'example.component.ts');
      expect(
        processor.postprocess(
          [[], [templateMessage()]],
          'example.component.ts',
        ),
      ).toEqual([expect.objectContaining({ line: 5 })]);
      // Nothing is left to map template messages with until the next preprocess()
      expect(
        processor.postprocess(
          [[], [templateMessage()]],
          'example.component.ts',
        ),
      ).toEqual([]);
    });

    it('is kept apart for files with the same name in different directories', () => {
      processor.preprocess(component(`'<p></p>'`), 'a/example.component.ts');
      processor.preprocess(
        '\n\n' + component(`'<p></p>'`),
        'b/example.component.ts',
      );
      expect(
        processor.postprocess(
          [[], [templateMessage()]],
          'a/example.component.ts',
        ),
      ).toEqual([expect.objectContaining({ line: 5 })]);
      expect(
        processor.postprocess(
          [[], [templateMessage()]],
          'b/example.component.ts',
        ),
      ).toEqual([expect.objectContaining({ line: 7 })]);
    });

    it('is recreated each time the same file is linted', async () => {
      // The attributes-order fix overlaps the banana-in-box one, so fixing
      // takes more than one pass, each preprocessing the file again
      const rules: RuleName[] = ['attributes-order', 'banana-in-box'];
      const input = component(
        String.raw`'<p>it\'s</p><input [value]="v" ([ngModel])="m" id="x" />'`,
      );

      const linter = createTemplateLinter(rules);
      const [first] = await linter.lintText(input, {
        filePath: 'example.component.ts',
      });
      const [second] = await linter.lintText(input, {
        filePath: 'example.component.ts',
      });
      expect(first.messages).toHaveLength(2);
      expect(second.messages).toEqual(first.messages);

      const [fixed] = await createTemplateLinter(rules, true).lintText(input, {
        filePath: 'example.component.ts',
      });
      expect(fixed.messages).toEqual([]);
      const decoded = await lintDecodedTemplate(rules, templateValue(input));
      expect(templateValue(fixed.output ?? '')).toBe(decoded.output);
    });
  });

  describe('files with a byte order mark', () => {
    it.each([
      ['single quotes', String.raw`'<p>\'</p><app-x></app-x>'`],
      ['backticks', '`<p></p><app-x></app-x>`'],
    ])('maps locations and fixes (%s)', async (_description, template) => {
      const input = `\uFEFF${component(template)}`;
      const [linted] = await createTemplateLinter(
        'prefer-self-closing-tags',
      ).lintText(input, { filePath: 'example.component.ts' });
      expect(linted.messages).toHaveLength(1);
      // ESLint reports locations in the file without its byte order mark
      expect(reportedText(input.slice(1), linted.messages[0])).toBe('</app-x>');

      const [fixed] = await createTemplateLinter(
        'prefer-self-closing-tags',
        true,
      ).lintText(input, { filePath: 'example.component.ts' });
      expect(fixed.output).toBe(
        `\uFEFF${component(template.replace('></app-x>', ' />'))}`,
      );
    });

    it.each([
      ['single quotes', String.raw`'<p>\'</p><app-x></app-x>'`],
      ['backticks', '`<p></p><app-x></app-x>`'],
    ])(
      'maps locations on the first line (%s)',
      async (_description, template) => {
        const input = `\uFEFF@Component({ template: ${template} }) export class A {}`;
        const [linted] = await createTemplateLinter(
          'prefer-self-closing-tags',
        ).lintText(input, { filePath: 'example.component.ts' });
        expect(linted.messages).toHaveLength(1);
        expect(reportedText(input.slice(1), linted.messages[0])).toBe(
          '</app-x>',
        );
      },
    );
  });
});
