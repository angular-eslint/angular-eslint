import processors from '../src/processors';

describe('extract-inline-html', () => {
  describe('preprocess()', () => {
    // Only consider files which follow the standard convention {NAME}.component.ts
    describe('non-component files', () => {
      const testCases = [
        {
          filename: 'component.ts',
        },
        {
          filename: 'foo.ts',
        },
        {
          filename: 'bar.cmp.ts',
        },
      ];

      const fileSource = `
        @Component({
          selector: '',
          foo: true
        })
        export class Component {}
      `;

      testCases.forEach((tc, i) => {
        it(`should not transform non-component file sources, CASE: ${i}`, () => {
          expect(
            processors['extract-inline-html'].preprocess(
              fileSource,
              tc.filename,
            ),
          ).toEqual([fileSource]);
        });
      });
    });

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
            processors['extract-inline-html'].preprocess(
              tc.input,
              'test.component.ts',
            ),
          ).toEqual([
            tc.input,
            {
              filename: 'inline-template.component.html',
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
              filename: 'inline-template.component.html',
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
      it(`should throw`, () => {
        expect(() => {
          processors['extract-inline-html'].preprocess(
            `
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
        `,
            'multiple-in-one.component.ts',
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `"@angular-eslint/eslint-plugin-template currently only supports 1 Component per file"`,
        );
      });
    });
  });
});
