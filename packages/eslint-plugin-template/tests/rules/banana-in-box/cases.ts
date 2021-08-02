import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/banana-in-box';

const messageId: MessageIds = 'bananaInBox';

export const valid = [
  '<input type="text" name="foo" [ngModel]="foo">',
  '<input type="text" name="foo" [(ngModel)]="foo">',
  `
      <button type="button" (click)="navigate(['/resources'])">
        Navigate
      </button>
    `,
];

export const invalid = [
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
