import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import type { MessageIds, Options } from '../../../src/rules/sort-signals';

const messageId: MessageIds = 'signalsNotSorted';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component()
    class Test {
      readonly inputProp = input();
      readonly outputMethod = output();
      readonly prop = signal();
    }
  `,
  `
    @Component()
    class Test {
      readonly inputProp = input.required();
      readonly outputMethod = output();
      readonly prop = signal();
    }
  `,
  `
    @Component()
    class Test {
      readonly inputProp = input();
      readonly outputMethod = output.required();
      readonly prop = signal();
    }
  `,
  `
    @Component()
    class Test {
      readonly inputProp = input.required();
      readonly outputMethod = output.required();
      readonly prop = signal();
    }
  `,
  `
    @Component()
    class Test {
      readonly inputProp = input();
      readonly modelProp = model();
      readonly outputMethod = output();
      readonly element = viewChild();
      readonly content = contentChild();
      readonly service = inject(Service);
      readonly prop = signal();
      readonly calculated = computed(() => prop + 1);
    }
  `,
  `
    @Component()
    class Test {
      readonly prop = signal();
    }
  `,
  `
    @Component()
    class Test {}
  `,
  {
    code: `
      @Component()
      class Test {
        readonly outputMethod = output.required();
        readonly inputProp = input.required();
        readonly service = inject(Service);
      }
      `,
    options: [{ order: ['output', 'input'] }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input() is declared after output()',
    annotatedSource: `
      @Component()
      class Test {
        readonly outputMethod = output();
        readonly inputProp = input();
                 ~~~~~~~~~
        readonly prop = signal();
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input.required() is declared after output()',
    annotatedSource: `
      @Component()
      class Test {
        readonly outputMethod = output();
        readonly inputProp = input.required();
                 ~~~~~~~~~
        readonly prop = signal();
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if model() is declared after output()',
    annotatedSource: `
      @Component()
      class Test {
        readonly inputProp = input();
        readonly outputMethod = output();
        readonly modelProp = model();
                 ~~~~~~~~~
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if output() is declared after signal()',
    annotatedSource: `
      @Component()
      class Test {
        readonly inputProp = input();
        readonly modelProp = model();
        readonly prop = signal();
        readonly outputMethod = output();
                 ~~~~~~~~~~~~
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if signal() is declared after computed()',
    annotatedSource: `
      @Component()
      class Test {
        readonly calculated = computed(() => prop + 1);
        readonly prop = signal();
                 ~~~~
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if output() is declared after input() with custom order ["output", "input"]',
    annotatedSource: `
      @Component()
      class Test {
        readonly inputProp = input();
        readonly outputMethod = output();
                 ~~~~~~~~~~~~
      }
      `,
    messageId,
    options: [{ order: ['output', 'input'] }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if any signal is declared before output() with custom order ["output", "input"]',
    annotatedSource: `
      @Component()
      class Test {
        readonly prop = signal();
        readonly outputMethod = output();
                 ~~~~~~~~~~~~
        readonly inputProp = input();
      }
      `,
    messageId,
    options: [{ order: ['output', 'input'] }],
  }),
];
