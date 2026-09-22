import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-let-for-async-pipe';

const messageId: MessageIds = 'preferLetForAsyncPipe';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '{{ user$ | async }}',
  '{{ user$ | async }} {{ settings$ | async }}',
  `
    @let user = user$ | async;
    {{ user?.name }}
    {{ user?.email }}
  `,
  `
    @if (condition) {
      {{ user$ | async }}
    } @else {
      {{ user$ | async }}
    }
  `,
  `
    <ng-template>{{ user$ | async }}</ng-template>
    <ng-template>{{ user$ | async }}</ng-template>
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'fails when the same async pipe is used twice in one view',
    annotatedSource: `
      {{ user$ | async }}
      {{ user$ | async }}
         ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'fails for equivalent implicit and explicit this receivers',
    annotatedSource: `
      {{ user$ | async }}
      {{ this.user$ | async }}
         ~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'fails for repeated async pipes inside an if view',
    annotatedSource: `
      @if (condition) {
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'fails for repeated async pipes inside a for view',
    annotatedSource: `
      @for (item of items; track item) {
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'reports every duplicate after the first async pipe',
    annotatedSource: `
      {{ user$ | async }}
      {{ user$ | async }}
         ~~~~~~~~~~~~~
      {{ user$ | async }}
         ^^^^^^^^^^^^^
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'fails for repeated method-call expressions',
    annotatedSource: `
      {{ getUser$() | async }}
      {{ getUser$() | async }}
         ~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
  }),
];
