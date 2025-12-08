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
];
