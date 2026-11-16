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
  {
    code: `
      @let user$ = selectedUser$;
      {{ user$ | async }} {{ this.user$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @let user$ = selectedUser$;
      @if (condition) {
        {{ user$ | async }} {{ this.user$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @for (user$ of streams; track $index) {
        {{ user$ | async }} {{ this.user$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @for (stream of streams; track $index; let user$ = $index) {
        @if (condition) {
          {{ user$ | async }} {{ this.user$ | async }}
        }
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <ng-template let-user$>
        {{ user$ | async }} {{ this.user$ | async }}
      </ng-template>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <ng-template let-user$>
        @if (condition) {
          {{ user$ | async }} {{ this.user$ | async }}
        }
      </ng-template>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <div *ngFor="let user$ of streams">
        {{ user$ | async }} {{ this.user$ | async }}
      </div>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @if (selectedUser$; as user$) {
        {{ user$ | async }} {{ this.user$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <user-card #card />
      {{ card.user$ | async }} {{ this.card.user$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <section *ngIf="visible" [title]="user$ | async"></section>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <section *ngIf="visible" [title]="user$ | async"></section>
      <section *ngIf="visible" [title]="user$ | async"></section>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <section *ngIf="user$ | async" [title]="user$ | async"></section>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @boundary {
        {{ user$ | async }}
      } @error {
        {{ user$ | async }}
      }
      {{ user$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @boundary {
        <p>Loaded</p>
      } @error (let user$ = $error) {
        {{ user$ | async }} {{ this.user$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  '{{ getStream$(0) | async }} {{ getStream$(1) | async }}',
  {
    code: `
      <user-card>
        @content(header) { {{ user$ | async }} }
      </user-card>
      {{ user$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <user-list>
        @content(row; let user$) {
          {{ user$ | async }} {{ this.user$ | async }}
        }
      </user-list>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ user$ | async }}
      <ng-content>{{ user$ | async }}</ng-content>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      <ng-content>
        @let user$ = selectedUser$;
        {{ user$ | async }} {{ this.user$ | async }}
      </ng-content>
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ $error.user$ | async }}
      @boundary {
        <p>Loaded</p>
      } @error (when $error.user$ | async) {
        <p>Failed</p>
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @boundary {
        <p>Loaded</p>
      } @error (when user$.retryable$ | async; let user$ = $error) {
        <p>Failed</p>
      }
      {{ user$.retryable$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      @boundary {
        <p>Loaded</p>
      } @error (when $error.retryable$ | async) {
        {{ $error.retryable$ | async }}
      }
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ (user?.profile).stream$ | async }}
      {{ user?.profile.stream$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ get$(\`users/\${id}\`) | async }}
      {{ get$(\`posts/\${id}\`) | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    // A parenthesized `this` still reads the component member, not the
    // template local.
    code: `
      @let user$ = other$;
      {{ (this).user$ | async }}
      {{ user$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ get$({ id: 1 }) | async }}
      {{ get$({ id: 2 }) | async }}
      {{ get$({ key: 1 }) | async }}
      {{ get$({ ...a }) | async }}
      {{ get$({ ...b }) | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    // Parentheses around an optional chain stop it from short-circuiting.
    code: `
      {{ (user?.profile!).stream$ | async }}
      {{ user?.profile!.stream$ | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ get$(/users/) | async }}
      {{ get$(/posts/) | async }}
    `,
    settings: { hideFromDocs: true },
  },
  {
    code: `
      {{ $error?.user$ | async }}
      @boundary {
        <p>Loaded</p>
      } @error (when $error?.user$ | async) {
        <p>Failed</p>
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
  convertAnnotatedSourceToFailureCase({
    description:
      'detects implicit and explicit this receivers when a local in another view has the same name',
    annotatedSource: `
      @if (condition) {
        @let user$ = selectedUser$;
      }
      {{ user$ | async }}
      {{ this.user$ | async }}
         ~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects repeated reads of the same template local',
    annotatedSource: `
      @let user$ = selectedUser$;
      {{ user$ | async }}
      {{ this.user$ | async }}
      {{ user$ | async }}
         ~~~~~~~~~~~~~
      {{ this.user$ | async }}
         ^^^^^^^^^^^^^^^^^^
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'detects duplicate inputs on an element with a structural directive once',
    annotatedSource: `
      <section *ngIf="visible" [title]="user$ | async" [attr.aria-label]="user$ | async"></section>
                                                                          ~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within a boundary error view',
    annotatedSource: `
      @boundary { <p>Loaded</p> } @error {
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      }
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within ng-content fallback content',
    annotatedSource: `
      <ng-content>
        {{ user$ | async }}
        {{ user$ | async }}
           ~~~~~~~~~~~~~
      </ng-content>
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'does not let locals declared in ng-content fallback content leak into the enclosing view',
    annotatedSource: `
      <ng-content>@let user$ = selectedUser$;</ng-content>
      {{ user$ | async }}
      {{ this.user$ | async }}
         ~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects an error block condition in the enclosing view',
    annotatedSource: `
      {{ retryable$ | async }}
      @boundary { <p>Loaded</p> } @error (when retryable$ | async) { <p>Failed</p> }
                                               ~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'detects an explicit this read in an error block condition in the enclosing view',
    annotatedSource: `
      {{ $error.user$ | async }}
      @boundary { <p>Loaded</p> } @error (when this.$error.user$ | async) { <p>Failed</p> }
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'detects duplicate pipes that read error context within one error block condition',
    annotatedSource: `
      @boundary { <p>Loaded</p> } @error (when ($error.a$ | async) || ($error.a$ | async)) { <p>Failed</p> }
                                                                       ~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects parenthesized expressions',
    annotatedSource: `
      {{ (user$) | async }}
      {{ (user$) | async }}
         ~~~~~~~~~~~~~~~
      {{ user$ | async }}
         ^^^^^^^^^^^^^
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects parenthesized conditional expressions',
    annotatedSource: `
      {{ (enabled ? first$ : second$) | async }}
      {{ (enabled ? first$ : second$) | async }}
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects parenthesized optional chains',
    annotatedSource: `
      {{ (user?.profile).stream$ | async }}
      {{ ((user?.profile)).stream$ | async }}
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects template literal arguments',
    annotatedSource: `
      {{ get$(\`users/\${id}\`) | async }}
      {{ get$(\`users/\${id}\`) | async }}
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects tagged template literals',
    annotatedSource: `
      {{ stream\`users/\${id}\` | async }}
      {{ stream\`users/\${id}\` | async }}
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'detects duplicate pipes within a content block',
    annotatedSource: `
      <user-card>
        @content(header) {
          {{ user$ | async }}
          {{ user$ | async }}
             ~~~~~~~~~~~~~
        }
      </user-card>
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'detects a parenthesized explicit this read when a template local shadows the name',
    annotatedSource: `
      @let user$ = other$;
      {{ this.user$ | async }}
      {{ (this).user$ | async }}
         ~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
  ...[
    'streams[id]',
    'user!.stream$',
    'get$(!a)',
    'get$(-a)',
    'get$(a + b)',
    'get$([a, b])',
    'get$(typeof a)',
  ].map((expression): InvalidTestCase<MessageIds, Options> =>
    convertAnnotatedSourceToFailureCase({
      description: `detects duplicate \`${expression}\` expressions`,
      annotatedSource: `
        {{ ${expression} | async }}
        {{ ${expression} | async }}
           ${'~'.repeat(expression.length + ' | async'.length)}
      `,
      messages: [{ char: '~', messageId }],
      settings: { hideFromDocs: true },
    }),
  ),
  convertAnnotatedSourceToFailureCase({
    description: 'detects object literal arguments',
    annotatedSource: `
      {{ get$({ id: 1, ...rest }) | async }}
      {{ get$({ 'id': 1, ...rest }) | async }}
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messages: [{ char: '~', messageId }],
    settings: { hideFromDocs: true },
  }),
];
