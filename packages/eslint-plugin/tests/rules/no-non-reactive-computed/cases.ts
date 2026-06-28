import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/no-non-reactive-computed';

const messageId: MessageIds = 'nonReactivePrimitive';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  ...[
    // computed() that reads a WritableSignal created with signal().
    `
    const a = signal(0);
    const c = computed(() => a() * 2);
  `,
    // computed() that reads a Signal-typed value.
    `
    let a: Signal<number>;
    const c = computed(() => a() + 1);
  `,
    // computed() that reads an InputSignal.
    `
    let a: InputSignal<number>;
    const c = computed(() => a());
  `,
    // computed() that reads a ModelSignal.
    `
    let a: ModelSignal<number>;
    const c = computed(() => a() + 1);
  `,
    // The signal is read inside a nested callback that runs synchronously.
    `
    let a: Signal<number[]>;
    const c = computed(() => a().map((x) => x * 2));
  `,
    // computed() that reads a signal through 'this'.
    `
    class Test {
      count = signal(0);
      c = computed(() => this.count() + 1);
    }
  `,
    // Conservative: a helper call might read a signal internally, so stay silent.
    `
    function helper(): number {
      return 1;
    }
    const c = computed(() => helper());
  `,
    // Conservative: a built-in call could be passed a signal-reading argument.
    `
    const x = 1.5;
    const c = computed(() => Math.floor(x));
  `,
    // computed() that reads the result of a nested computed.
    `
    let a: Signal<number>;
    const c = computed(() => {
      const inner = computed(() => a() * 2);
      return inner() + 1;
    });
  `,
    // linkedSignal() shorthand that reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal(() => a() + 1);
  `,
    // linkedSignal() options form: the 'source' reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal({ source: () => a(), computation: (s) => s * 2 });
  `,
    // linkedSignal() options form: the 'computation' reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal({ source: () => 1, computation: () => a() });
  `,
    // effect() that reads a signal.
    `
    let a: Signal<number>;
    effect(() => {
      console.log(a());
    });
  `,
    // Conservative: an effect whose only call is unanalysable stays silent.
    `
    effect(() => {
      console.log('side effect');
    });
  `,
    // resource() is not checked unless 'checkResources' is enabled.
    `
    const r = resource({ params: () => 1, loader: () => null });
  `,
    // Not Angular's computed(): a member expression callee is ignored.
    `
    declare const Test: { computed: (fn: () => unknown) => unknown };
    Test.computed(() => 1);
  `,
    // 'computed' referenced without being called.
    `
    const x = computed;
  `,
  ].map(appendTypes),

  // resource() with checkResources: the 'params' reads a signal.
  {
    code: appendTypes(`
    let a: Signal<number>;
    const r = resource({ params: () => a(), loader: () => null });
  `),
    options: [{ checkResources: true }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads only a non-reactive variable',
    annotatedSource: `
        const value = 42;
        const c = computed(() => value * 2);
                  ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() returns a literal',
    annotatedSource: `
        const c = computed(() => 42);
                  ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads only a plain property',
    annotatedSource: `
        class Test {
          name = 'x';
          c = computed(() => this.name);
              ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() is a function expression with no signal read',
    annotatedSource: `
        const c = computed(function () {
                  ~~~~~~~~~~~~~~~~~~~~~~
          return 42;
          ~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'non-reactive computed() with an options argument',
    annotatedSource: `
        const c = computed(() => 1, { equal: (a, b) => a === b });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'linkedSignal() shorthand with no signal read',
    annotatedSource: `
        const c = linkedSignal(() => 42);
                  ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'linkedSignal' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'linkedSignal() options form where neither function is reactive',
    annotatedSource: `
        const c = linkedSignal({ source: () => 1, computation: (s) => s + 1 });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'linkedSignal' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() with no signal read',
    annotatedSource: `
        const value = 1;
        effect(() => value + 1);
        ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'effect' },
  }),
  {
    ...convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description:
        'resource() with static params when checkResources is enabled',
      annotatedSource: `
        const r = resource({ params: () => 1, loader: () => null });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: { primitive: 'resource' },
    }),
    options: [{ checkResources: true }],
  },
].map((test) => ({
  ...test,
  code: appendTypes(test.code),
}));

function appendTypes(code: string): string {
  // Exclude the types from the generated docs because they
  // are standard Angular types and only need to be defined
  // so that the type symbols in the tests are correct.
  /* istanbul ignore next */
  if (process.env.GENERATING_RULE_DOCS === '1') {
    return code;
  }

  // Put the given code on the same line as the import so that the tests don't have
  // to adjust the line numbers to account for the code that we insert at the start.
  return (
    'import { computed, InputSignal, ModelSignal, signal, Signal } from "@angular/core";' +
    code
  );
}
