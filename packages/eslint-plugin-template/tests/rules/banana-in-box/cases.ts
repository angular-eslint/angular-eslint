import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/banana-in-box';

const messageId: MessageIds = 'bananaInBox';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<input type="text" name="foo" [ngModel]="foo">',
  '<input type="text" name="foo" [(ngModel)]="foo">',
  `
      <button type="button" (click)="navigate(['/resources'])">
        Navigate
      </button>
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if the parens and square brackets are reversed',
    annotatedSource: `
        <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
                  ~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^
        <div [baz]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
                                                ###################
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
    ],
    annotatedOutput: `
        <app-item [(bar)]="bar" [(item)]="item" [(test)]="test"></app-item>
                                               
        <div [baz]="oneWay" (emitter)="emitter" [(twoWay)]="twoWay"></div>
                                                
      `,
  }),
];
