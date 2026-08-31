import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-signal-model';

const messageIdPreferSignalModel: MessageIds = 'preferSignalModel';

export const valid = [
  // Using model() is the preferred approach
  `
    class Test {
      readonly enabled = model();
    }
    `,
  `
    class Test {
      readonly enabled = model<boolean>();
    }
    `,
  // Input without corresponding output is fine
  `
    class Test {
      readonly enabled = input();
    }
    `,
  // Output without corresponding input is fine
  `
    class Test {
      readonly enabledChange = output();
    }
    `,
  // Output with different name pattern
  `
    class Test {
      readonly enabled = input();
      readonly onChange = output();
    }
    `,
  // Input with transform option should not be flagged because model() does not support transform
  `
    import { booleanAttribute } from '@angular/core';
    class Test {
      readonly enabled = input(false, { transform: booleanAttribute });
      readonly enabledChange = output<boolean>();
    }
    `,
  // Also valid when using a custom transform function
  `
    import { numberAttribute } from '@angular/core';
    class Test {
      readonly count = input(0, { transform: numberAttribute });
      readonly countChange = output<number>();
    }
    `,
  // Different input/output types cannot be merged into a single model()
  `
    class Test {
      readonly value = input<string>();
      readonly valueChange = output<number>();
    }
    `,
  // A wider input union than the output type cannot be merged either
  `
    class Test {
      readonly value = input<string | null>();
      readonly valueChange = output<string>();
    }
    `,
  // A required input whose type does not match the output
  `
    class Test {
      readonly value = input.required<string>();
      readonly valueChange = output<number>();
    }
    `,
  // The same mismatches are found when the types are compared semantically
  {
    code: `
    class Test {
      readonly value = input<string>();
      readonly valueChange = output<number>();
    }
    `,
    options: [{ useTypeChecking: true }],
  },
  {
    code: `
    class Test {
      readonly value = input<string | null>();
      readonly valueChange = output<string>();
    }
    `,
    options: [{ useTypeChecking: true }],
  },
  // The input type is inferred from its initial value and does not match
  {
    code: `
    class Test {
      readonly value = input('');
      readonly valueChange = output<number>();
    }
    `,
    options: [{ useTypeChecking: true }],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when input and output form a two-way binding pattern',
    annotatedSource: `
      class Test {
        readonly enabled = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly enabledChange = output();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly enabled = model();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for all patterns when there are multiple two-way binding patterns',
    annotatedSource: `
      class Test {
        readonly enabled = input();
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^
        readonly enabledChange = output();
        readonly test = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~
        readonly testChange = output();
      }
      `,
    messages: [
      { char: '^', messageId: messageIdPreferSignalModel },
      { char: '~', messageId: messageIdPreferSignalModel },
    ],
    annotatedOutputs: [
      `import { model } from '@angular/core';

      class Test {
        readonly enabled = model();
                                   
        
        readonly test = input();
        
        readonly testChange = output();
      }
      `,
      `import { model } from '@angular/core';

      class Test {
        readonly enabled = model();
                                   
        
        readonly test = model();
        
        
      }
      `,
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when input and output are not adjacent and form a two-way binding pattern',
    annotatedSource: `
      class Test {
        readonly value = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly otherProp = input();
        readonly valueChange = output();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly value = model();
        
        readonly otherProp = input();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should handle typed inputs and outputs',
    annotatedSource: `
      class Test {
        readonly count = input<number>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly countChange = output<number>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly count = model<number>();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when input and output types are semantically equal but written differently',
    annotatedSource: `
      class Test {
        readonly value = input<string | null>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly valueChange = output<null | string>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    options: [{ useTypeChecking: true }],
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly value = model<string | null>();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when output is declared before input',
    annotatedSource: `
      class Test {
        readonly enabledChange = output();
        readonly enabled = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        
        readonly enabled = model();
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not add duplicate import when model is already imported',
    annotatedSource: `
      import { model, input, output } from '@angular/core';

      class Test {
        readonly enabled = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly enabledChange = output();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `
      import { model, input, output } from '@angular/core';

      class Test {
        readonly enabled = model();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still fail for convertible inputs when another input has transform options',
    annotatedSource: `
      class Test {
        readonly enabled = input(false, { transform: booleanAttribute });
        readonly enabledChange = output<boolean>();
        readonly count = input(0);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly countChange = output<number>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: [
      `import { model } from '@angular/core';`,
      '',
      `      class Test {`,
      `        readonly enabled = input(false, { transform: booleanAttribute });`,
      `        readonly enabledChange = output<boolean>();`,
      `        readonly count = model(0);`,
      `        `,
      `        `,
      `      }`,
      `      `,
    ].join('\n'),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an object initial value has a transform property',
    annotatedSource: `
      class Test {
        readonly style = input({ transform: 'scale(2)' });
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly styleChange = output<object>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: [
      `import { model } from '@angular/core';`,
      '',
      `      class Test {`,
      `        readonly style = model({ transform: 'scale(2)' });`,
      `        `,
      `        `,
      `      }`,
      `      `,
    ].join('\n'),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should migrate a required input to `model.required`',
    annotatedSource: `
      class Test {
        readonly value = input.required<string>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly valueChange = output<string>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly value = model.required<string>();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when input and output types are structurally identical',
    annotatedSource: `
      class Test {
        readonly value = input<{ id: string }>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly valueChange = output<{ id: string }>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    options: [{ useTypeChecking: true }],
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly value = model<{ id: string }>();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when the input type inferred from its initial value matches the output',
    annotatedSource: `
      class Test {
        readonly value = input('');
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly valueChange = output<string>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    options: [{ useTypeChecking: true }],
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly value = model('');
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should replace the `input` call rather than a property named `input`',
    annotatedSource: `
      class Test {
        readonly input = input<string>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly inputChange = output<string>();
      }
      `,
    messageId: messageIdPreferSignalModel,
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly input = model<string>();
        
        
      }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when neither the input nor the output type can be determined',
    annotatedSource: `
      class Test {
        readonly enabled = input();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        readonly enabledChange = output();
      }
      `,
    messageId: messageIdPreferSignalModel,
    options: [{ useTypeChecking: true }],
    annotatedOutput: `import { model } from '@angular/core';

      class Test {
        readonly enabled = model();
        
        
      }
      `,
  }),
];
