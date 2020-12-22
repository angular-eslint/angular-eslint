import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { MessageIds, RULE_NAME } from '../../src/rules/banana-in-box';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'bananaInBox';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<input type="text" name="foo" [ngModel]="foo">',
    '<input type="text" name="foo" [(ngModel)]="foo">',
    `
      <button type="button" (click)="navigate(['/resources'])">
        Navigate
      </button>
    `,
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
      code: `
        <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
        <div [baz]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
      `,
      errors: [
        { column: 19, line: 2, messageId },
        { column: 33, line: 2, messageId },
        { column: 49, line: 3, messageId },
      ],
      output: `
        <app-item [(bar)]="bar" [(item)]="item" [(test)]="test"></app-item>
        <div [baz]="oneWay" (emitter)="emitter" [(twoWay)]="twoWay"></div>
      `,
    },
  ],
});
