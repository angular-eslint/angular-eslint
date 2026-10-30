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
  {
    code: `
      @if (user$ | async; as user) {
        {{ (user$ | async)?.id }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @for (item of items$ | async; track item) {
        {{ items$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @switch (mode) {
        @case ('first') { {{ user$ | async }} }
        @case ('second') { {{ user$ | async }} }
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @defer {
        {{ user$ | async }}
      } @placeholder {
        {{ user$ | async }}
      } @loading {
        {{ user$ | async }}
      } @error {
        {{ user$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @defer (when ready$ | async) {
        {{ ready$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <div *ngIf="user$ | async">{{ user$ | async }}</div>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <div *ngFor="let user of users$ | async">{{ users$ | async }}</div>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @let user = user$ | async;
      @if (condition) { {{ user$ | async }} }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @switch (state$ | async) {
        @case ('ready') { {{ state$ | async }} }
      }
    `,
    settings: { hideFromDocs: true },
  },
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
  convertAnnotatedSourceToFailureCase({
    description: 'detects sibling structural ngIf conditions',
    annotatedSource: `
      <div *ngIf="user$ | async"></div>
      <div *ngIf="user$ | async"></div>
                  ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects sibling structural ngFor iterables',
    annotatedSource: `
      <li *ngFor="let user of users$ | async"></li>
      <li *ngFor="let user of users$ | async"></li>
                              ~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects sibling if conditions',
    annotatedSource: `
      @if (user$ | async) {}
      @if (user$ | async) {}
           ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects repeated for iterable in enclosing view',
    annotatedSource: `
      {{ (items$ | async)?.length }}
      @for (item of items$ | async; track item) {}
                    ~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects switch condition in enclosing view',
    annotatedSource: `
      {{ state$ | async }}
      @switch (state$ | async) {
               ~~~~~~~~~~~~~~
        @case ('ready') { <p>Ready</p> }
      }
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within switch case view',
    annotatedSource: `
      @switch (mode) {
        @case ('first') {
          {{ user$ | async }}
          {{ user$ | async }}
             ~~~~~~~~~~~~~
        }
      }
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects defer trigger in enclosing view',
    annotatedSource: `
      {{ ready$ | async }}
      @defer (when ready$ | async) { <p>Ready</p> }
                   ~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within defer body',
    annotatedSource: `
      @defer {
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      }
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within placeholder view',
    annotatedSource: `
      @defer { <p>Loaded</p> } @placeholder {
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      }
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate let declarations',
    annotatedSource: `
      @let first = user$ | async;
      @let second = user$ | async;
                    ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects sibling input bindings',
    annotatedSource: `
      <div [title]="user$ | async"></div>
      <div [title]="user$ | async"></div>
                    ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate input bindings on one element',
    annotatedSource: `
      <div [title]="user$ | async" [attr.aria-label]="user$ | async"></div>
                                                      ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
];
