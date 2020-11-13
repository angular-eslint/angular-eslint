import processors, {
  isFileLikelyToContainComponentDeclarations,
} from '../src/processors';

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
              filename: 'inline-template-1.component.html',
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
              filename: 'inline-template-1.component.html',
              text: inlineTemplate,
            },
          ]);
        });
      });
    });

    /**
     * Currently explicitly unsupported...
     */
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
            filename: 'inline-template-1.component.html',
            text: '<h1>Hello, A!</h1>',
          },
          {
            filename: 'inline-template-2.component.html',
            text: '<h1>Hello, B!</h1>',
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
  });
});
