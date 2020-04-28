import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { MessageIds, RULE_NAME } from '../../src/rules/banana-in-a-box';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'bananaInABox';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      filename: 'test.component.html',
      code: `<input type="text" name="foo" [ngModel]="foo">`,
    },
    {
      filename: 'test.component.html',
      code: `<input type="text" name="foo" [(ngModel)]="foo">`,
    },
    {
      filename: 'test.component.html',
      code: `
        <button type="button" (click)="navigate(['/resources'])">
          Navigate
        </button>
`,
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the parens and square brackets are reversed',
      annotatedSource: `
        <input type="text" name="foo" ([ngModel])="foo">
                                      ~~~~~~~~~~~~~~~~~
      `,
      messageId,
      annotatedOutput: `
        <input type="text" name="foo" [(ngModel)]="foo">
                                      ~~~~~~~~~~~~~~~~~
      `,
    }),
    {
      filename: 'test.component.html',
      code: `
        <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
        <div [baz]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
      `,
      errors: [
        {
          messageId,
          line: 2,
          column: 19,
        },
        {
          messageId,
          line: 2,
          column: 33,
        },
        {
          messageId,
          line: 3,
          column: 49,
        },
      ],
      output: `
        <app-item [(bar)]="bar" [(item)]="item" [(test)]="test"></app-item>
        <div [baz]="oneWay" (emitter)="emitter" [(twoWay)]="twoWay"></div>
      `,
    },
  ],
});
