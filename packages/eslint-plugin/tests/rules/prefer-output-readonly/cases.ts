import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-output-readonly';

const messageId: MessageIds = 'preferOutputReadonly';
const suggestAddReadonlyModifier: MessageIds = 'suggestAddReadonlyModifier';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    class Test {
      testEmitter = new EventEmitter<string>();
    }
    `,
  `
    class Test {
      @Output() readonly testEmitter = new EventEmitter<string>();
    }
    `,
  `
    class Test {
      testEmitter: NotOutputEmitterRef<string>;
    }
    `,
  `
    class Test {
      readonly testEmitter: OutputEmitterRef<string>;
    }
    `,
  `
    class Test {
      testEmitter = notOutput();
    }
    `,
  `
    class Test {
      readonly testEmitter = output();
    }
    `,
  `
    class Test {
      testEmitter = notOutput<string>();
    }
    `,
  `
    class Test {
      readonly testEmitter = output<string>();
    }
    `,
  `
    class Test {
      readonly testEmitter: OutputRef<string>;
    }
    `,
  `
    class Test {
      readonly testEmitter = outputFromObservable(testObservable);
    }
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an @Output is not readonly',
    annotatedSource: `
        class Test {
          @Output() testEmitter = new EventEmitter<string>();
                    ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: '@Output' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          @Output() readonly testEmitter = new EventEmitter<string>();
                    
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an OutputEmitterRef is not readonly',
    annotatedSource: `
        class Test {
          testEmitter: OutputEmitterRef<string>;
          ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: 'OutputEmitterRef' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testEmitter: OutputEmitterRef<string>;
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an output() is not readonly',
    annotatedSource: `
        class Test {
          testEmitter = output();
          ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: 'OutputEmitterRef' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testEmitter = output();
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an output<T>() is not readonly',
    annotatedSource: `
        class Test {
          testEmitter = output<string>();
          ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: 'OutputEmitterRef' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testEmitter = output<string>();
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an OutputRef is not readonly',
    annotatedSource: `
        class Test {
          testEmitter: OutputRef<string>;
          ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: 'OutputRef' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testEmitter: OutputRef<string>;
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an outputFromObservable() is not readonly',
    annotatedSource: `
        class Test {
          testEmitter = outputFromObservable(testObservable);
          ~~~~~~~~~~~
        }
      `,
    messageId,
    data: { type: 'OutputRef' },
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testEmitter = outputFromObservable(testObservable);
          
        }
      `,
      },
    ],
  }),
];
