import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-signals';

const messageIdPreferReadonlySignalProperties: MessageIds =
  'preferReadonlySignalProperties';
const messageIdPreferInputSignals: MessageIds = 'preferInputSignals';
const messageIdPreferQuerySignals: MessageIds = 'preferQuerySignals';
const suggestAddReadonlyModifier: MessageIds = 'suggestAddReadonlyModifier';

export const valid = [
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

  // preferReadonlySignalProperties
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
    options: [{ preferReadonlySignalProperties: false }],
  },
  {
    code: `
      class Test {
        readonly testSignal = createSignal('test');
      }
      `,
    // Custom known signal creation functions can be added to the options
    options: [{ additionalSignalCreationFunctions: ['createSignal'] }],
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

  // preferInputSignals
  `
    class Test {
      readonly value = input();
    }
    `,
  {
    code: `
      class Test {
        @Input()
        readonly value = 1;
      }
      `,
    options: [{ preferInputSignals: false }],
  },

  // preferQuerySignals
  `
    class Test {
      readonly query = viewChild('test');
    }
    `,
  {
    code: `
      class Test {
        @ViewChild('test')
        value: Widget;
      }
      `,
    options: [{ preferQuerySignals: false }],
  },
  `
    class Test {
      readonly query = viewChildren('test');
    }
    `,
  {
    code: `
      class Test {
        @ViewChildren('test')
        value: QueryList<Widget>;
      }
      `,
    options: [{ preferQuerySignals: false }],
  },
  `
    class Test {
      readonly query = contentChild('test');
    }
    `,
  {
    code: `
      class Test {
        @ContentChild('test')
        value: Widget;
      }
      `,
    options: [{ preferQuerySignals: false }],
  },
  `
    class Test {
      readonly query = contentChildren('test');
    }
    `,
  {
    code: `
      class Test {
        @ContentChildren('test')
        value: QueryList<Widget>;
      }
      `,
    options: [{ preferQuerySignals: false }],
  },
];

export const invalid = [
  // preferReadonlySignalProperties
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a Signal is not readonly',
    annotatedSource: `
        class Test {
          testSignal: Signal<number>;
          ~~~~~~~~~~
        }
      `,
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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
    options: [{ additionalSignalCreationFunctions: ['createSignal'] }],
    messageId: messageIdPreferReadonlySignalProperties,
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
    messageId: messageIdPreferReadonlySignalProperties,
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

  // preferInputSignals
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @Input() is used',
    annotatedSource: `
    class Test {
      @Input()
      ~~~~~~~~
      value = 1;
    }
    `,
    messageId: messageIdPreferInputSignals,
  }),

  // preferQuerySignals
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @ViewChild() is used',
    annotatedSource: `
    class Test {
      @ViewChild('test')
      ~~~~~~~~~~~~~~~~~~
      value: Widget;
    }
    `,
    messageId: messageIdPreferQuerySignals,
    data: { function: 'viewChild', decorator: 'ViewChild' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @ViewChildren() is used',
    annotatedSource: `
    class Test {
      @ViewChildren('test')
      ~~~~~~~~~~~~~~~~~~~~~
      value: QueryList<Widget>;
    }
    `,
    messageId: messageIdPreferQuerySignals,
    data: { function: 'viewChildren', decorator: 'ViewChildren' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @ContentChild() is used',
    annotatedSource: `
    class Test {
      @ContentChild('test')
      ~~~~~~~~~~~~~~~~~~~~~
      value: Widget;
    }
    `,
    messageId: messageIdPreferQuerySignals,
    data: { function: 'contentChild', decorator: 'ContentChild' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @ContentChildren() is used',
    annotatedSource: `
    class Test {
      @ContentChildren('test')
      ~~~~~~~~~~~~~~~~~~~~~~~~
      value: QueryList<Widget>;
    }
    `,
    messageId: messageIdPreferQuerySignals,
    data: { function: 'contentChildren', decorator: 'ContentChildren' },
  }),
];
