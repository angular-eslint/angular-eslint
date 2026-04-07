import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-non-null-assertion';

const messageId: MessageIds = 'noNonNullAssertion';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // Simple expressions
  `{{ foo }}`,
  `{{ foo.bar }}`,
  `{{ foo.bar.baz }}`,

  // Optional chaining
  `{{ foo?.bar }}`,
  `{{ foo?.bar?.baz }}`,
  `{{ user?.profile?.address?.city }}`,

  // Nullish coalescing
  `{{ foo ?? 'default' }}`,
  `{{ (data?.items?.length ?? 0) > 0 }}`,

  // Method calls
  `{{ getValue() }}`,
  `{{ foo?.getValue() }}`,
  `{{ user?.getProfile()?.getName() }}`,

  // Array access
  `{{ items[0] }}`,
  `{{ items?.[0] }}`,

  // Pipes
  `{{ value | uppercase }}`,
  `{{ user?.name | uppercase }}`,
  `{{ value | pipe : arg }}`,

  // Property bindings
  `<div [title]="user?.name"></div>`,

  // Event bindings
  `<button (click)="handler(item)">Click</button>`,

  // Control flow - @if
  `@if (condition) { <div>Content</div> }`,
  `@if (user?.isActive) { <div>Active</div> }`,

  // Control flow - @for
  `@for (item of items; track item.id) { <div>{{ item.name }}</div> }`,
  `@for (item of data?.items; track item.id) { <div>{{ item.name }}</div> }`,

  // Control flow - @switch
  `@switch (status) { @case ('active') { <div>Active</div> } }`,
  `@switch (user?.status) { @case ('active') { <div>Active</div> } }`,

  // Control flow - @let
  `@let userId = 42;`,
  `@let user = getUser();`,

  // Structural directives
  `<div *ngIf="condition">Content</div>`,

  // Binary expressions
  `{{ a + b }}`,
  `{{ value + 10 }}`,
  `{{ a === b }}`,
  `{{ value === 'test' }}`,

  // Logical expressions
  `{{ !value }}`,
  `{{ a && b }}`,

  // Ternary expressions
  `{{ condition ? value : other }}`,
  `{{ condition ? 'yes' : 'no' }}`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion on simple identifier',
    annotatedSource: `
        {{ foo! }}
           ~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion on property access',
    annotatedSource: `
        {{ foo!.bar }}
           ~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in pipe expression',
    annotatedSource: `
        {{ user.name! | uppercase }}
           ~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in pipe argument',
    annotatedSource: `
        {{ user | uppercase : firstArg : secondArg! }}
                                         ~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in nested pipe with parentheses',
    annotatedSource: `
        {{ user.name | uppercase : (prefix! | lowercase) }}
                                    ~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in property binding',
    annotatedSource: `
        <div [title]="user!.name"></div>
                      ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @let',
    annotatedSource: `
        @let user = a.b!.c;
                    ~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @let with method call',
    annotatedSource: `
        @let user = getUser()!;
                    ~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in method call parameter',
    annotatedSource: `
        {{ x.y({ param: a.b!.c }) }}
                        ~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion on method call result',
    annotatedSource: `
        {{ getValue()! }}
           ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with nested non-null assertion',
    annotatedSource: `
        {{ foo.bar!.baz }}
           ~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with optional nested non-null assertion',
    annotatedSource: `
        {{ foo?.bar!.baz }}
           ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in event binding',
    annotatedSource: `
        <button (click)="handler(item!)">Click</button>
                                 ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in *ngIf',
    annotatedSource: `
        <div *ngIf="foo!">Content</div>
                    ~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @if condition',
    annotatedSource: `
        @if (user!) { <div>Content</div> }
             ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion on nested property in @if',
    annotatedSource: `
        @if (user!.isActive) { <div>Active</div> }
             ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @for expression',
    annotatedSource: `
        @for (item of items!; track item.id) { <div>{{ item.name }}</div> }
                      ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @for track expression',
    annotatedSource: `
        @for (item of items; track item!.id) { <div>{{ item.name }}</div> }
                                   ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @switch expression',
    annotatedSource: `
        @switch (status!) { @case ('active') { <div>Active</div> } }
                 ~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in @case block',
    annotatedSource: `
        @switch (status) { @case (activeStatus!) { <div>Active</div> } }
                                  ~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion on method call in chain',
    annotatedSource: `
        {{ user.getProfile()!.getName() }}
           ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in complex expression',
    annotatedSource: `
        @if ((data!.items?.length ?? 0) > 0) { <div>Has items</div> }
              ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in ternary expression',
    annotatedSource: `
        {{ user! ? user.name : 'Guest' }}
           ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion before array access',
    annotatedSource: `
        {{ items![0] }}
           ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion after array access',
    annotatedSource: `
        {{ items[0]! }}
           ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in binary expression (left)',
    annotatedSource: `
        {{ value! + 10 }}
           ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in binary expression (right)',
    annotatedSource: `
        {{ 10 + value! }}
                ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in comparison',
    annotatedSource: `
        {{ value! === 'test' }}
           ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in negation',
    annotatedSource: `
        {{ !value! }}
            ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in ternary condition',
    annotatedSource: `
        {{ condition! ? 'yes' : 'no' }}
           ~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in ternary true branch',
    annotatedSource: `
        {{ condition ? value! : 'no' }}
                       ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in loose equality',
    annotatedSource: `
        {{ a + b?.c! - d == 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in strict equality',
    annotatedSource: `
        {{ a + b?.c! - d === 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in less than comparison',
    annotatedSource: `
        {{ a + b?.c! - d < 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in less or equal than comparison',
    annotatedSource: `
        {{ a + b?.c! - d <= 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in greater than comparison',
    annotatedSource: `
        {{ a + b?.c! - d > 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion in greater or equal than comparison',
    annotatedSource: `
        {{ a + b?.c! - d >= 42 }}
               ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in nullish coalescing',
    annotatedSource: `
        {{ condition ?? value! }}
                        ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in ternary false branch',
    annotatedSource: `
        {{ condition ? 'yes' : value! }}
                               ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in method call receiver',
    annotatedSource: `
        {{ service!.getData() }}
           ~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion in method arguments',
    annotatedSource: `
        <button (click)="handler(item!)">Click</button>
                                 ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion after array access with safe property',
    annotatedSource: `
        {{ x[y]![z] }}
           ~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion after nested array access with safe property',
    annotatedSource: `
        {{ x[y][z]! }}
           ~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with non-null assertion on method call',
    annotatedSource: `
        {{ x.y.z!() }}
           ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with non-null assertion on method call with safe navigation',
    annotatedSource: `
        {{ x.y?.z!() }}
           ~~~~~~~
      `,
    messageId,
  }),
];
