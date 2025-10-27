import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/button-has-type';
import { INVALID_TYPE_DATA_KEY } from '../../../src/rules/button-has-type';

const missingType: MessageIds = 'missingType';
const invalidType: MessageIds = 'invalidType';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `<button [attr.type]="'button'"></button>`,
  `<button [attr.type]="'submit'"></button>`,
  `<button [attr.type]="'reset'"></button>`,
  `<button type="button"></button>`,
  `<BUTTON type="button"></BUTTON>`,
  `<button type="submit"></button>`,
  `<button type="reset"></button>`,
  `<button class="primary" type="submit"></button>`,
  `<button (click)="onClick()" type="button"></button>`,
  `<button [class.primary]="true" [attr.type]="'submit'"></button>`,
  `<button [disabled]="true" [attr.type]="'button'"></button>`,
  {
    code: `<button myButton></button>`,
    options: [{ ignoreWithDirectives: ['myButton'] }],
  },
  {
    code: `<button [myButton]></button>`,
    options: [{ ignoreWithDirectives: ['myButton'] }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a button has no attributes',
    annotatedSource: `
      <button></button>
      ~~~~~~~~~~~~~~~~~
    `,
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an uppercase button has no attributes',
    annotatedSource: `
      <BUTTON></BUTTON>
      ~~~~~~~~~~~~~~~~~
    `,
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a button has attributes, but no type',
    annotatedSource: `
      <button (click)="onClick()"></button>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a button has an invalid type attribute',
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
    description: 'should fail if a button has an invalid type bound attribute ',
    annotatedSource: `
      <button [attr.type]="'whatever'"></button>
              ~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidType,
    data: {
      [INVALID_TYPE_DATA_KEY]: 'whatever',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a button has no type attribute, and ignoreWithDirectives option specifies directives, but none of the directives are present',
    annotatedSource: `
      <button myDirective></button>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ ignoreWithDirectives: ['myButton', 'uiButton'] }],
    messageId: missingType,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a button has an invalid type attribute, and ignoreWithDirectives option specifies directives and element has one of them',
    annotatedSource: `
      <button myButton type="whatever"></button>
                       ~~~~~~~~~~~~~~~
    `,
    options: [{ ignoreWithDirectives: ['myButton'] }],
    messageId: invalidType,
    data: {
      [INVALID_TYPE_DATA_KEY]: 'whatever',
    },
  }),
];
