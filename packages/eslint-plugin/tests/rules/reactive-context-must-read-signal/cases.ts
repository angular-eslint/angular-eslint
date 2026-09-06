import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/reactive-context-must-read-signal';

const messageId: MessageIds = 'mustReadSignal';

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
    // Conservative: a method of another class might read a signal internally.
    `
    class Service {
      getValue(): number {
        return 1;
      }
    }
    class Test {
      service = new Service();
      c = computed(() => this.service.getValue());
    }
  `,
    // Conservative: an Angular API that is not a signal read stays unknown.
    `
    const c = computed(() => untracked(() => 1));
  `,
    // Conservative: a standard library call that is handed a function value we
    // cannot look inside, e.g. 'this.transform', might read a signal.
    `
    class Test {
      items = [1, 2, 3];
      transform(value: number): number {
        return value;
      }
      c = computed(() => this.items.map(this.transform));
    }
  `,
    // Conservative: constructing a user-defined class runs arbitrary code.
    `
    class Box {
      value = 1;
    }
    const c = computed(() => new Box().value);
  `,
    // Conservative: a template tag runs arbitrary code.
    `
    declare function html(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): string;
    const c = computed(() => html\`static\`);
  `,
    // Conservative: a getter can read a signal without looking like a call.
    `
    class Test {
      count = signal(0);
      get double(): number {
        return this.count() * 2;
      }
      c = computed(() => this.double);
    }
  `,
    // computed() that reads the result of a nested computed.
    `
    let a: Signal<number>;
    const c = computed(() => {
      const inner = computed(() => a() * 2);
      return inner() + 1;
    });
  `,
    // Conservative: the tracked function is not an inline function, so we
    // cannot tell whether it reads a signal.
    `
    function compute(): number {
      return 1;
    }
    const c = computed(compute);
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
    // linkedSignal() options form: the documented usage passes the signal
    // itself as the 'source', which we cannot analyse as a function.
    `
    let a: Signal<string[]>;
    const c = linkedSignal({ source: a, computation: (options) => options[0] });
  `,
    // linkedSignal() options form: a spread could provide a reactive 'source'.
    `
    declare const options: { source: () => number };
    const c = linkedSignal({ ...options, computation: (s) => s + 1 });
  `,
    // effect() that reads a signal.
    `
    let a: Signal<number>;
    effect(() => {
      console.log(a());
    });
  `,
    // afterRenderEffect() shorthand that reads a signal.
    `
    let a: Signal<number>;
    afterRenderEffect(() => a() + 1);
  `,
    // afterRenderEffect() phases form: one of the phases reads a signal.
    `
    let a: Signal<number>;
    afterRenderEffect({
      earlyRead: () => 1,
      write: () => a(),
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

const invalidBase: readonly InvalidTestCase<MessageIds, Options>[] = [
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
    description:
      'computed() calls a standard library method on a non-reactive value',
    annotatedSource: `
        class Test {
          name = 'x';
          c = computed(() => this.name.toUpperCase());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a standard library method with an inline callback',
    annotatedSource: `
        class Test {
          items = [1, 2, 3];
          c = computed(() => this.items.filter((item) => item > 1));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() only calls a global from the standard library',
    annotatedSource: `
        const x = 1.5;
        const c = computed(() => Math.floor(x));
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() constructs a standard library class',
    annotatedSource: `
        const c = computed(() => new Date().getFullYear());
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() that only logs a non-reactive value',
    annotatedSource: `
        effect(() => {
        ~~~~~~~~~~~~~~
          console.log('side effect');
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'effect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'afterRenderEffect() shorthand with no signal read',
    annotatedSource: `
        afterRenderEffect(() => 42);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'afterRenderEffect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'afterRenderEffect() phases form with no signal read',
    annotatedSource: `
        afterRenderEffect({
        ~~~~~~~~~~~~~~~~~~~
          earlyRead: () => 1,
          ~~~~~~~~~~~~~~~~~~~
          write: (value) => value + 1,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'afterRenderEffect' },
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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] =
  invalidBase.map((test) => ({
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
    'import { afterRenderEffect, computed, effect, InputSignal, linkedSignal, ModelSignal, resource, signal, Signal, untracked } from "@angular/core";' +
    code
  );
}
