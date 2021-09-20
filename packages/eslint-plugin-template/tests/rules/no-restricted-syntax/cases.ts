import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-restricted-syntax';

const messageId: MessageIds = 'noRestrictedSyntax';

export const valid = [
  {
    code: `
      {{ amIUsingStrictEquality === true ? 'Yes' : 'No' }}
    `,
    options: [`Binary[operation=/^(==|!=)$/]`],
  },
  {
    code: `
      <input [formControl]="formControl">
      <textarea [ngModel]="formControl"></textarea>
      <ng-template>Child here!</ng-template>
    `,
    options: [
      `Template[children.length=0]`,
      {
        selector: `Element[name='input'] > BoundAttribute[name='ngModel']`,
      },
    ],
  },
  {
    code: `
      <div [class]="classes"></div>
    `,
    options: [
      {
        selector: `:matches(BoundAttribute, TextAttribute)[name='ngClass']`,
      },
    ],
  },
  {
    code: `
      <ng-container *translator="let translator">
        {{ translator | async }}
      </ng-container>
      {{ one ?? other }}
    `,
    options: [
      {
        message: 'Do not use `| json`.',
        selector: `BindingPipe[name='json']`,
      },
      {
        selector: `Conditional`,
      },
    ],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `Interpolation`',
    annotatedSource: `
      <article>{{readSomethingPlease}}</article>
               ~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: {
      message: 'Using `Interpolation` is not allowed.',
    },
    options: ['Interpolation'],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `Element`',
    annotatedSource: `
      <button>Click me!</button>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: {
      message: 'Missing an explicit type attribute for button',
    },
    options: [
      {
        selector:
          "Element[name='button']:not(:has(:matches(BoundAttribute, TextAttribute)[name='type']))",
        message: 'Missing an explicit type attribute for button',
      },
      // We always take the first selector and ignore duplicates, so the displayed message will be the one in the first (or default in case of omission).
      "Element[name='button']:not(:has(:matches(BoundAttribute, TextAttribute)[name='type']))",
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `TextAttribute`',
    annotatedSource: `
      <button type="invalidType">Click me!</button>
              ~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: {
      message:
        "Using `Element[name='button'] :matches(BoundAttribute, TextAttribute)[name='type'][value!=/^(button|reset|submit)$/]` is not allowed.",
    },
    options: [
      {
        selector:
          "Element[name='button'] :matches(BoundAttribute, TextAttribute)[name='type'][value!=/^(button|reset|submit)$/]",
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `BoundAttribute`',
    annotatedSource: `
      <button [ngClass]="classes?.class1">Click me!</button>
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: {
      message: 'Using `BoundAttribute[name="ngClass"]` is not allowed.',
    },
    options: [
      'BoundAttribute[name="ngClass"]',
      {
        message:
          'Message ignored since this selector is duplicated and comes after.',
        selector: 'BoundAttribute[name="ngClass"]',
      },
    ],
  }),
];
