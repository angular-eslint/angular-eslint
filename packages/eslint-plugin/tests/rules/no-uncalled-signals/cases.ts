import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { MessageIds, Options } from '../../../src/rules/no-uncalled-signals';

const messageId: MessageIds = 'noUncalledSignals';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    const arbitraryVar = 1;
    if (arbitraryVar) {
    }
  `,
  `
    const aSignal = createSignal();
    if (aSignal()) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    if (aSignal() || true) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    if (aSignal() == "hello") {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    if (false || (aSignal() ?? true)) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    if (false) {
      aSignal
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    let aSignal: Signal | null = createSignal();
    if (aSignal) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    let aSignal: Signal | undefined = createSignal();
    if (aSignal) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    let aSignal: Signal | NonSignal = createSignal();
    if (aSignal) {
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
    interface NonSignal {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  // If statements:
  convertAnnotatedSourceToFailureCase({
    description:
      '(If Statement) should fail if the signal is not invoked as the only expression',
    annotatedSource: `
        const aSignal = createSignal();
        if (aSignal) {
            ~~~~~~~
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(If Statement) should fail if the signal is not invoked as part of a logical expression',
    annotatedSource: `
        const aSignal = createSignal(false);
        if (aSignal || true) {
            ~~~~~~~
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(If Statement) should fail if a signal is not invoked as part of a comparison',
    annotatedSource: `
        const aSignal = createSignal("hello");
        if (aSignal == "hello") {
            ~~~~~~~
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(If Statement) should fail if the signal is not invoked deep in an expression',
    annotatedSource: `
        const aSignal = createSignal();
        if (false || (aSignal ?? true)) {
                      ~~~~~~~
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  // Conditional Expressions
  convertAnnotatedSourceToFailureCase({
    description:
      '(conditional expression) should fail if the signal is not invoked as the only expression',
    annotatedSource: `
        const aSignal = createSignal();
        const v = aSignal ? true : false;
                  ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(conditional expression) should fail if the signal is not invoked as part of a logical expression',
    annotatedSource: `
        const aSignal = createSignal(false);
        const v = (aSignal || true) ? true : false;
                   ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(conditional expression) should fail if a signal is not invoked as part of a comparison',
    annotatedSource: `
        const aSignal = createSignal("hello");
        const v = (aSignal == "hello") ? true : false;
                   ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(conditional expression) should fail if the signal is not invoked deep in an expression',
    annotatedSource: `
        const aSignal = createSignal();
        const v = (false || (aSignal ?? true)) ? true : false
                             ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
  }),
];
