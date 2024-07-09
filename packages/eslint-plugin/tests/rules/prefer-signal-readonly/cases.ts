import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-signal-readonly';

const messageId: MessageIds = 'preferSignalReadonly';
const suggestAddReadonlyModifier: MessageIds = 'suggestAddReadonlyModifier';

export const valid = [
  `
    class Test {
      testValue = test();
    }
    `,
  `
    class Test {
      testValue: number;
    }
    `,
  `
    class Test {
      testValue: Widget<number>;
    }
    `,
  `
    class Test {
      readonly testSignal: Signal<number>;
    }
    `,
  `
    class Test {
      readonly testSignal: InputSignal<number>;
    }
    `,
  `
    class Test {
      readonly testSignal: ModelSignal<number>;
    }
    `,
  `
    class Test {
      readonly testSignal: WritableSignal<number>;
    }
    `,
  `
    class Test {
      readonly testSignal = computed(() => 0);
    }
    `,
  `
    class Test {
      readonly testSignal = contentChild('test');
    }
    `,
  `
    class Test {
      readonly testSignal = contentChild.required('test');
    }
    `,
  `
    class Test {
      readonly testSignal = contentChildren('test');
    }
    `,
  `
    class Test {
      readonly testSignal = input('');
    }
    `,
  `
    class Test {
      readonly testSignal = input.required();
    }
    `,
  `
    class Test {
      readonly testSignal = model();
      readonly testRequired = model.required(42);
    }
    `,
  `
    class Test {
      readonly testSignal = signal(true);
    }
    `,
  `
    class Test {
      readonly testSignal = toSignal(source);
    }
    `,
  `
    class Test {
      readonly testSignal = viewChild('test');
    }
    `,
  `
    class Test {
      readonly testSignal = viewChild.required('test');
    }
    `,
  `
    class Test {
      readonly testSignal = viewChildren('test');
    }
    `,
  `
    class Test {
      testSignal = createSignal('test');
    }
    `,
  {
    code: `
      class Test {
        readonly testSignal = createSignal('test');
      }
      `,
    options: [{ signalCreationFunctions: ['createSignal'] }],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a Signal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: Signal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal: Signal<number>;
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an InputSignal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: InputSignal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal: InputSignal<number>;
          
        }
      `,
      },
    ],
  }),

  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a ModelSignal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: ModelSignal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal: ModelSignal<number>;
          
        }
      `,
      },
    ],
  }),

  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a WritableSignal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: WritableSignal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal: WritableSignal<number>;
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a computed is not readonly',
    annotatedSource: `
        class Test {
          testSignal = computed(() => 0);
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal = computed(() => 0);
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a contentChild is not readonly',
    annotatedSource: `
        class Test {
          testSignal = contentChild('test');
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal = contentChild('test');
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a contentChild.required is not readonly',
    annotatedSource: `
        class Test {
          testSignal = contentChild.required('test');
          ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
        class Test {
          readonly testSignal = contentChild.required('test');
          
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a contentChildren is not readonly',
    annotatedSource: `
      class Test {
        testSignal = contentChildren('test');
        ~~~~~~~~~~
      }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
      class Test {
        readonly testSignal = contentChildren('test');
        
      }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an input is not readonly',
    annotatedSource: `
    class Test {
      testSignal = input('');
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = input('');
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when an input.required is not readonly',
    annotatedSource: `
    class Test {
      testSignal = input.required('');
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = input.required('');
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a model is not readonly',
    annotatedSource: `
    class Test {
      testSignal = model(42);
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = model(42);
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a model.required is not readonly',
    annotatedSource: `
    class Test {
      testSignal = model.required();
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = model.required();
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a signal is not readonly',
    annotatedSource: `
    class Test {
      testSignal = signal(42);
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = signal(42);
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a toSignal is not readonly',
    annotatedSource: `
    class Test {
      testSignal = toSignal(source);
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = toSignal(source);
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a viewChild is not readonly',
    annotatedSource: `
    class Test {
      testSignal = viewChild('test');
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = viewChild('test');
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a viewChild.required is not readonly',
    annotatedSource: `
    class Test {
      testSignal = viewChild.required('test');
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = viewChild.required('test');
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a viewChildren is not readonly',
    annotatedSource: `
    class Test {
      testSignal = viewChildren('test');
      ~~~~~~~~~~
    }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = viewChildren('test');
      
    }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a Signal assigned from a user-specified function is not readonly',
    annotatedSource: `
    class Test {
      testSignal = createSignal('test');
      ~~~~~~~~~~
    }
    `,
    options: [{ signalCreationFunctions: ['createSignal'] }],
    messageId,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = createSignal('test');
      
    }
    `,
      },
    ],
  }),
];
