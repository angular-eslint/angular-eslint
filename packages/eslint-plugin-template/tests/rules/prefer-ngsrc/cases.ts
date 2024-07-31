import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-ngsrc';

const missingAttribute: MessageIds = 'missingAttribute';
const invalidDoubleSource: MessageIds = 'invalidDoubleSource';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<img ngSrc="http://localhost">',
  "<img [ngSrc]=\"'http://localhost'>",
  '<img [ngSrc]="value">',
  '<img src="data:image/jpeg;base64">',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail image when using src over ngsrc',
    annotatedSource: `
      <ng-template>
        <img src="http://localhost">
             ~~~~~~~~~~~~~~~~~~~~~~
        <img [src]="'http://localhost'">
             ^^^^^^^^^^^^^^^^^^^^^^^^^^
        <img [src]="value">
             #############
      </ng-template>
      `,
    messages: [
      {
        char: '~',
        messageId: missingAttribute,
      },
      {
        char: '^',
        messageId: missingAttribute,
      },
      {
        char: '#',
        messageId: missingAttribute,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail image when using both src and ngsrc',
    annotatedSource: `
      <ng-template>
        <img ngSrc="http://localhost" src="http://localhost">
                                      ~~~~~~~~~~~~~~~~~~~~~~
        <img ngSrc="http://localhost" [src]="'http://localhost'">
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^
        <img ngSrc="http://localhost" [src]="value">
                                      #############
        <img [ngSrc]="otherValue" src="http://localhost">
                                  **********************
        <img [ngSrc]="otherValue" [src]="'http://localhost'">
                                  @@@@@@@@@@@@@@@@@@@@@@@@@@
        <img [ngSrc]="otherValue" [src]="value">
                                  %%%%%%%%%%%%%
        <img [src]="otherValue" [ngSrc]="value">
             ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
        <img src="data:image/png;base64" [ngSrc]="otherValue">
             ¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨
      </ng-template>
      `,
    messages: [
      {
        char: '~',
        messageId: invalidDoubleSource,
      },
      {
        char: '^',
        messageId: invalidDoubleSource,
      },
      {
        char: '#',
        messageId: invalidDoubleSource,
      },
      {
        char: '*',
        messageId: invalidDoubleSource,
      },
      {
        char: '@',
        messageId: invalidDoubleSource,
      },
      {
        char: '%',
        messageId: invalidDoubleSource,
      },
      {
        char: '¶',
        messageId: invalidDoubleSource,
      },
      {
        char: '¨',
        messageId: invalidDoubleSource,
      },
    ],
  }),
];
