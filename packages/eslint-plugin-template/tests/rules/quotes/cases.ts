import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds, Options } from '../../../src/rules/quotes';
import type { ValidTestCase } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester';

const messageId: MessageIds = 'quotes';
export const valid: (ValidTestCase<Options> | string)[] = [
  `<div class="my-class"></div>`,
  `<my-component [input]="myInput"></my-component>`,
  `<my-component (output)="myFunc()"></my-component>`,
  {
    code: `<div class='my-class'></div>`,
    options: [
      {
        quotesType: 'single',
      },
    ],
  },
  {
    code: `<my-component [input]='myInput'></my-component>`,
    options: [
      {
        quotesType: 'single',
      },
    ],
  },
  {
    code: `<my-component (output)='myFunc()'></my-component>`,
    options: [
      {
        quotesType: 'single',
      },
    ],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'double',
      actualQuotesType: 'single',
    },
    description: 'it should fail if using single quotes with text attribute',
    annotatedSource: `
      <div class='my-class'></div>
                 ~~~~~~~~~~
    `,
    annotatedOutput: `
      <div class="my-class"></div>
                 ~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'double',
      actualQuotesType: 'single',
    },
    description: 'it should fail if using single quotes with input binding',
    annotatedSource: `
      <my-component [input]='myInput'></my-component>
                            ~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component [input]="myInput"></my-component>
                            ~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'double',
      actualQuotesType: 'single',
    },
    description: 'it should fail if using single quotes with output binding',
    annotatedSource: `
      <my-component (output)='myFunc()'></my-component>
                             ~~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component (output)="myFunc()"></my-component>
                             ~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'single',
      actualQuotesType: 'double',
    },
    description: 'it should fail if using double quotes with text attribute',
    options: [
      {
        quotesType: 'single',
      },
    ],
    annotatedSource: `
      <div class="my-class"></div>
                 ~~~~~~~~~~
    `,
    annotatedOutput: `
      <div class='my-class'></div>
                 ~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'single',
      actualQuotesType: 'double',
    },
    description: 'it should fail if using double quotes with input binding',
    options: [
      {
        quotesType: 'single',
      },
    ],
    annotatedSource: `
      <my-component [input]="myInput"></my-component>
                            ~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component [input]='myInput'></my-component>
                            ~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    data: {
      expectedQuotesType: 'single',
      actualQuotesType: 'double',
    },
    description: 'it should fail if using double quotes with output binding',
    options: [
      {
        quotesType: 'single',
      },
    ],
    annotatedSource: `
      <my-component (output)="myFunc()"></my-component>
                             ~~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component (output)='myFunc()'></my-component>
                             ~~~~~~~~~~
    `,
  }),
];
