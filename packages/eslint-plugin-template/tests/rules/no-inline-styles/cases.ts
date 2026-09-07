import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-inline-styles';

const messageId: MessageIds = 'noInlineStyles';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<img alt="Foo eating a sandwich.">',
  '<img src="foo" [attr.alt]="altText">',
  `<img src="foo" [attr.alt]="'Alt Text'">`,
  '<img src="foo" alt="">',
  '<object aria-label="foo">',
  '<object aria-labelledby="id1">',
  '<object>Meaningful description</object>',
  '<object title="An object">',
  '<area aria-label="foo" />',
  '<area aria-labelledby="id1" />',
  '<area alt="This is descriptive!" />',
  '<input type="text">',
  '<input type="image" alt="This is descriptive!">',
  '<input type="image" aria-label="foo">',
  '<input type="image" aria-labelledby="id1">',
  '<div [attr.stylesheet]="x">',
  {
    code: `<input [ngStyle]="{ 'background-color': '#fff' }">`,
    options: [{ allowNgStyle: true }],
  },
  {
    code: `<input [style.backgroundColor]="'#fff'">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input [style]="{ 'background-color': '#fff' }">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input [style]="styleObject">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input [style.width.px]="w">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input style="{{ x }}">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input bind-style="x">`,
    options: [{ allowBindToStyle: true }],
  },
  {
    code: `<input [ngStyle]="{ 'background-color': 'red' }" [style.background-color]="'#fff'">`,
    options: [{ allowNgStyle: true, allowBindToStyle: true }],
  },
  {
    code: `<input [ngStyle]="{ 'background-color': 'red' }" [style]="styleObject" [style.background-color]="'#fff'">`,
    options: [
      {
        allowNgStyle: true,
        allowBindToStyle: true,
      },
    ],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail element when style attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <img style="position: relative;">
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'img' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when object style attribute exist',
    annotatedSource: `
        <object style="padding: 30px;"></object>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'object' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when area style attribute exist',
    annotatedSource: `
        <area style="padding: 30px;" />
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'area' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when input element with style attribute exist',
    annotatedSource: `
        <input style="color: red;">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when input element with attr.style binding exist',
    annotatedSource: `
        <input [attr.style]="'padding: 10px;'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with style property binding exist',
    annotatedSource: `
        <input [style.background-color]="'#fff'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with style bindings exist and allowNgStyle set to true',
    annotatedSource: `
        <input [style]="'border: 1px solid black;'" [ngStyle]="{ 'padding': '10px' }" [style.background-color]="'#fff'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
    options: [{ allowNgStyle: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when input element with ngStyle binding exist',
    annotatedSource: `
        <input [ngStyle]="'background-color: #fff'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with style binding exists with only allowNgStyle set to true',
    annotatedSource: `
        <input [style]="'border: 1px solid black;'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
    options: [{ allowNgStyle: true, allowBindToStyle: false }],
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with attr.style binding exists even with allowBindToStyle set to true',
    annotatedSource: `
        <input [attr.style]="'padding: 10px;'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
    options: [{ allowBindToStyle: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element has ngStyle and style bindings without allowBindToStyle',
    annotatedSource: `
        <input [ngStyle]="{ 'padding': '10px' }" [style]="'border: 1px solid black;'">
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
    options: [{ allowNgStyle: true, allowBindToStyle: false }],
  }),
];
