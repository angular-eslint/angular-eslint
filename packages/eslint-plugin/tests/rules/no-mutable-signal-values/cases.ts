import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-mutable-signal-values';
import { addSignalImports } from '../../test-utils/signal-helpers';

const messageId: MessageIds = 'noMutableSignalValues';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // Primitive types.
  'let a: Signal<number>;',
  'let a: Signal<string>;',
  'let a: Signal<boolean>;',
  'let a: Signal<bigint>;',
  'let a: Signal<null>;',
  'let a: Signal<undefined>;',
  'let a: Signal<1>;',
  'let a: Signal<"a">;',
  'let a: Signal<true>;',
  'let a: Signal<1n>;',
  `
    enum Foo { A, B };
    let a: Signal<Foo>;
  `,
  `
    const enum Foo { A, B };
    let a: Signal<Foo>;
  `,

  // Readonly Arrays.
  'let a: Signal<readonly number[]>;',
  'let a: Signal<ReadonlyArray<number>>;',
  'let a: Signal<readonly (number | string)[]>;',
  'let a: Signal<readonly [r: number, g: number, b: number]>;',

  // ReadonlySet and ReadonlyMap.
  'let a: Signal<ReadonlySet<number>>;',
  'let a: Signal<ReadonlyMap<number, number>>;',
  `
    type ReadonlySetOfNumber = ReadonlySet<number>;
    let a: Signal<ReadonlySetOfNumber>;
  `,
  `
    type ReadonlyMapOfNumberToNumber = ReadonlyMap<number, number>;
    let a: Signal<ReadonlyMapOfNumberToNumber>;
  `,

  // Configured immutable types.
  {
    code: `
      class Foo {}
      let a: Signal<Foo>;
    `,
    options: [{ immutableTypes: ['Foo', 'Bar'] }],
  } satisfies ValidTestCase<Options>,
  {
    code: `
      interface Foo {}
      let a: Signal<Foo>;
    `,
    options: [{ immutableTypes: ['Foo', 'Bar'] }],
  } satisfies ValidTestCase<Options>,

  // Immutable object literals.
  'let a: Signal<{ readonly b: number }>;',
  'let a: Signal<{ readonly b: number; readonly c: string }>;',
  'let a: Signal<{ readonly b: number; readonly c: { readonly d: string }}>;',
  'let a: Signal<Readonly<{ b: number; c: { readonly d: string }}>>;',

  // Immutable interfaces.
  `
    interface Foo { readonly a: number }
    let a: Signal<Foo>;
  `,
  `
    interface Foo { readonly a: number; readonly b: Bar; }
    interface Bar { readonly c: number; }
    let a: Signal<Foo>;
  `,

  // Unions.
  'let a: Signal<number | null>;',
  'let a: Signal<number | undefined>;',
  'let a: Signal<number | string>;',
  'let a: Signal<number | readonly number[]>;',
  'let a: Signal<number | { readonly b: number; readonly c: number }>;',
  `
    type Foo = 'a' | 'b';
    let a: Signal<Foo>;
  `,

  // Nested signals.
  'let a: Signal<Signal<number>>;',
  'let a: Signal<readonly Signal<number>[]>;',
  `
    interface Foo { readonly a: Signal<number>; }
    let a: Signal<Foo>;
  `,

  // Other signal types.
  'let a: InputSignal<number>;',
  'let a: ModelSignal<number>;',
  'let a: WritableSignal<number>;',
  'let a: InputSignalWithTransform<number, string>;',

  // Inferred signal types.
  'let a = signal(1);',
  'let a = input(1);',

  // Signal properties.
  'class Foo { readonly a: Signal<number>; }',
  'interface Foo { readonly a: Signal<number>; }',
  'type Foo = { readonly a: Signal<number>; }',
].map((test) =>
  typeof test === 'string'
    ? { name: test, code: addSignalImports(test) }
    : { ...test, name: test.code, code: addSignalImports(test.code) },
);

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is mutable array',
    annotatedSource: `
      let a: Signal<number[]>;
             ~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is immutable array with mutable values',
    annotatedSource: `
      let a: Signal<readonly { a: number }[]>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is Set',
    annotatedSource: `
      let a: Signal<Set<number>>;
             ~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is ReadonlySet with mutable values',
    annotatedSource: `
      let a: Signal<ReadonlySet<{ a: number }>>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is Map',
    annotatedSource: `
      let a: Signal<Map<number, string>>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is ReadonlyMap with mutable keys',
    annotatedSource: `
      let a: Signal<ReadonlyMap<{ a: number }, number>>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is ReadonlyMap with mutable values',
    annotatedSource: `
      let a: Signal<ReadonlyMap<number, { a: number }>>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is mutable object literal',
    annotatedSource: `
      let a: Signal<{ a: number }>;
             ~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is object literal that is immutable at the top level but mutable at deeper level',
    annotatedSource: `
      let a: Signal<{ readonly a: { readonly b: { c: number }}}>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is mutable class',
    annotatedSource: `
      class Foo { a: number };
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is mutable interface',
    annotatedSource: `
      interface Foo { a: number };
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is mutable type',
    annotatedSource: `
      type Foo = { a: number };
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is union with mutable type',
    annotatedSource: `
      let a: Signal<number | { a: number }>;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is class with mutable parameter properties',
    annotatedSource: `
      class Foo {
        constructor(public a: number) {}
      }
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is class with methods',
    annotatedSource: `
      class Foo {
        public foo() {}
      }
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail if signal value is class that is not declared as immutable',
    annotatedSource: `
      class Foo { a: number; }
      class Bar { b: number; }
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    options: [{ immutableTypes: ['Bar'] }],
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if signal value is interface with methods',
    annotatedSource: `
      interface Foo { a(): void; }
      let a: Signal<Foo>;
             ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail if inferred signal type has immutable value',
    annotatedSource: `
      let a = signal({ a: 1 });
          ~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should check class properties',
    annotatedSource: `
      class Foo {
        protected readonly a: Signal<number[]>;
                              ~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should check interface properties',
    annotatedSource: `
      interface Foo {
        readonly a: Signal<number[]>;
                    ~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
  }),
].map((test) => ({
  ...test,
  code: addSignalImports(test.code),
  errors: test.errors.map((error) => ({
    ...error,
  })),
}));
