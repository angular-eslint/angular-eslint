import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-signal';

const messageIdPreferSignal: MessageIds = 'preferSignal';
const messageIdPreferReadonly: MessageIds = 'preferReadonly';
const suggestAddReadonlyModifier: MessageIds = 'suggestAddReadonlyModifier';

export const valid = [
  // preferSignal
  `
    class Test {
      testSubject = new Subject();
    }
    `,
  `
    class Test {
      testSubject = new ReplaySubject(1);
    }
    `,
  {
    code: `
      class Test {
        noTypesToReplace = new BehaviorSubject();
      }
      `,
    options: [{ typesToReplace: [] }],
  },
  {
    code: `
      class Test {
        customTypesToReplace = new BehaviorSubject();
      }
      `,
    options: [{ typesToReplace: ['CustomType'] }],
  },

  // preferReadonly
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
        testSignal = signal('test');
      }
      `,
    options: [{ preferReadonly: false }],
  },
  {
    code: `
      class Test {
        readonly testSignal = createSignal('test');
      }
      `,
    options: [{ signalCreationFunctions: ['createSignal'] }],
  },
  `
    class Test {
      testSignal = createSignal();
    }
    function createSignal(): Signal<boolean> {
      return signal(true);
    }
    `,
  {
    code: `
      class Test {
        readonly testSignal = createSignal();
      }
      function createSignal(): Signal<boolean> {
        return signal(true);
      }
      `,
    options: [{ useTypeChecking: true }],
  },
  {
    code: `
      class Test {
        testNotSignal = createNotSignal();
      }
      function createNotSignal(): NotSignal<boolean> {
        return true;
      }
      `,
    options: [{ useTypeChecking: true }],
  },
];

export const invalid = [
  // preferSignal
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a BehaviorSubject is created and the default types to replace are used',
    annotatedSource: `
    class Test {
      testSubject = new BehaviorSubject(1);
                        ~~~~~~~~~~~~~~~
    }
    `,
    messageId: messageIdPreferSignal,
    data: { type: 'BehaviorSubject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a custom type is created and the type is specified as a type to replace',
    annotatedSource: `
    class Test {
      testType = new SecondType(2);
                     ~~~~~~~~~~
    }
    `,
    messageId: messageIdPreferSignal,
    data: { type: 'SecondType' },
    options: [{ typesToReplace: ['FirstType', 'SecondType'] }],
  }),

  // preferReadonly
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a Signal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: Signal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
    messageId: messageIdPreferReadonly,
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a Signal calculated with type-checking is not readonly',
    annotatedSource: `
    class Test {
      testSignal = createSignal();
      ~~~~~~~~~~
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
    `,
    options: [{ useTypeChecking: true }],
    messageId: messageIdPreferReadonly,
    suggestions: [
      {
        messageId: suggestAddReadonlyModifier,
        output: `
    class Test {
      readonly testSignal = createSignal();
      
    }
    declare function createSignal(): Signal<boolean>;
    interface Signal<T> {}
    `,
      },
    ],
  }),
];
