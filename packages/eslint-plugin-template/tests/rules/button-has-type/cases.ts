import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from 'packages/eslint-plugin-template/src/rules/button-has-type';
import { INVALID_TYPE_DATA_KEY } from 'packages/eslint-plugin-template/src/rules/button-has-type';

const missingType: MessageIds = 'missingType';
const invalidType: MessageIds = 'invalidType';

export const valid = [
  `<button [attr.type]="'button'"></button>`,
  `<button [attr.type]="'submit'"></button>`,
  `<button [attr.type]="'reset'"></button>`,
  `<button type="button"></button>`,
  `<button type="submit"></button>`,
  `<button type="reset"></button>`,
  `<button class="primary" type="submit"></button>`,
  `<button (click)="onClick()" type="button"></button>`,
  `<button [class.primary]="true" [attr.type]="'submit'"></button>`,
  `<button [disabled]="true" [attr.type]="'button'"></button>`,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if button has no attributes',
    annotatedSource: `
      <button></button>
      ~~~~~~~~~~~~~~~~~
    `,
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if button has attributes, but no type',
    annotatedSource: `
      <button (click)="onClick()"></button>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if button has invalid attribute type',
    annotatedSource: `
      <button type="whatever"></button>
              ~~~~~~~~~~~~~~~
    `,
    messageId: invalidType,
    data: {
      [INVALID_TYPE_DATA_KEY]: 'whatever',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if button has invalid bound attribute type',
    annotatedSource: `
      <button [attr.type]="'whatever'"></button>
              ~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidType,
    data: {
      [INVALID_TYPE_DATA_KEY]: 'whatever',
    },
  }),
];
