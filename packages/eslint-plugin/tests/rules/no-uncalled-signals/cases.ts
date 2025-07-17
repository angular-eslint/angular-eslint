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
  `
    const aSignal = createSignal();
    const v = aSignal() ?? true;
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    const v = aSignal() || true;
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  `
    const aSignal = createSignal();
    const v = aSignal;
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
  `,
  // Test cases for the reported bug - direct signal calls on member expressions
  `
    export class AppComponent {
      readonly test = signal<boolean>(false);

      constructor() {
        effect(() => {
          if (this.test()) {
            console.log('Hey');
          } else {
            console.log('Hoo');
          }
        });
      }
    }
    declare function signal<T>(value: T): Signal<T>;
    declare function effect(fn: () => void): void;
    interface Signal<T> {}
  `,
  `
    export class AppComponent {
      readonly test = signal<boolean>(false);

      constructor() {
        const t = this.test;
        effect(() => {
          if (t()) {
            console.log('Hey');
          } else {
            console.log('Hoo');
          }
        });
      }
    }
    declare function signal<T>(value: T): Signal<T>;
    declare function effect(fn: () => void): void;
    interface Signal<T> {}
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/2574
  `
    let a: Signal<string>;
    let b: boolean;
    let c = b && a.set('');

    interface Signal<T> {
      set(value: T): void;
    }
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        if (aSignal()) {
            
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal(false);
        if (aSignal() || true) {
            
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal("hello");
        if (aSignal() == "hello") {
            
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        if (false || (aSignal() ?? true)) {
                      
        }
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        const v = aSignal() ? true : false;
                  
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal(false);
        const v = (aSignal() || true) ? true : false;
                   
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
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
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal("hello");
        const v = (aSignal() == "hello") ? true : false;
                   
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(conditional expression) should fail if the signal is not invoked deep in an expression',
    annotatedSource: `
        const aSignal = createSignal();
        const v = (false || (aSignal ?? true)) ? true : false;
                             ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        const v = (false || (aSignal() ?? true)) ? true : false;
                             
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(null coalescing to variable) should fail if the signal is not invoked in an expression',
    annotatedSource: `
        const aSignal = createSignal();
        const v = aSignal ?? true;
                  ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        const v = aSignal() ?? true;
                  
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      '(boolean OR to variable) should fail if the signal is not invoked in an expression',
    annotatedSource: `
        const aSignal = createSignal();
        const v = aSignal || true;
                  ~~~~~~~
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        const aSignal = createSignal();
        const v = aSignal() || true;
                  
        declare function createSignal(): Signal<boolean>;
        interface Signal<T> {}
    `,
      },
    ],
  }),
];
