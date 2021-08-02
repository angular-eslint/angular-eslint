import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
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
];
