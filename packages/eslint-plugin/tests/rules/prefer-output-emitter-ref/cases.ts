import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-output-emitter-ref';

const messageIdPreferOutputEmitterRef: MessageIds = 'preferOutputEmitterRef';
const messageIdPreferReadonly: MessageIds = 'preferReadonly';

export const valid = [
  `
    @Component()
    class Test {
      change = outputValue();
    }
    `,
  `
    @Component()
    class Test {
      change = new EventEmitter();
    }
    `,
  `
    @Component()
    class Test {
      readonly change = output();
    }
    `,
  `
    @Directive()
    class Test {
      readonly change = output();
    }
    `,
  `
    @Component()
    class Test {
      readonly change = output<string>();
    }
    `,
  `
    @Directive()
    class Test {
      readonly change = output<string>();
    }
    `,
  `
    class Test {
      // This is allowed because it is not in a component or directive.
      change = output();
    }
    `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an @Output is used',
    annotatedSource: `
      class Test {
        @Output()
        ~~~~~~~~~
        readonly change: EventEmitter<number>;
      }
      `,
    messageId: messageIdPreferOutputEmitterRef,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an output() is not readonly in a component',
    annotatedSource: `
      @Component()
      class Test {
        change = output();
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Component()
      class Test {
        readonly change = output();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an output() is not readonly in a directive',
    annotatedSource: `
      @Directive()
      class Test {
        change = output();
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Directive()
      class Test {
        readonly change = output();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an output<T>() is not readonly in a component',
    annotatedSource: `
      @Component()
      class Test {
        change = output<string>();
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Component()
      class Test {
        readonly change = output<string>();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an output<T>() is not readonly in a directive',
    annotatedSource: `
      @Directive()
      class Test {
        change = output<string>();
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Directive()
      class Test {
        readonly change = output<string>();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an OutputEmitterRef is not readonly in a component',
    annotatedSource: `
      @Component()
      class Test {
        change: OutputEmitterRef<string>;
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Component()
      class Test {
        readonly change: OutputEmitterRef<string>;
        
      }
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an OutputEmitterRef is not readonly in a directive',
    annotatedSource: `
      @Directive()
      class Test {
        change: OutputEmitterRef<string>;
        ~~~~~~
      }
      `,
    messageId: messageIdPreferReadonly,
    annotatedOutput: `
      @Directive()
      class Test {
        readonly change: OutputEmitterRef<string>;
        
      }
      `,
  }),
];
