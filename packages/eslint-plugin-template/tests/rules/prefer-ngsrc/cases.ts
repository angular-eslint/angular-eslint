import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/prefer-ngsrc';

const missingAttribute: MessageIds = 'missingAttribute';
const invalidDoubleSource: MessageIds = 'invalidDoubleSource';

export const valid = [
  '<img ngSrc="http://localhost">',
  "<img [ngSrc]=\"'http://localhost'>",
  '<img [ngSrc]="value">',
];

export const invalid = [
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
    ],
  }),
];
