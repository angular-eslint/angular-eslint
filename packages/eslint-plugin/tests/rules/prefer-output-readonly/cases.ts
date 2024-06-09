import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-output-readonly';

const messageId: MessageIds = 'preferOutputReadonly';
const suggestAddReadonlyModifier: MessageIds = 'suggestAddReadonlyModifier';

export const valid = [
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an @Output is not readonly',
    annotatedSource: `
        class Test {
          @Output() testEmitter = new EventEmitter<string>();
                    ~~~~~~~~~~~
        }
      `,
    messageId,
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
];
