import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/input-not-event-emitter';

const messageId: MessageIds = 'inputNotEventEmitter';
const suggestChangeInputToOutput: MessageIds = 'suggestChangeInputToOutput';

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
    description: 'should fail when an @Input is declared as an `EventEmitter`',
    annotatedSource: `
        class Test {
          @Input() readonly testEmitter = new EventEmitter<string>();
          ~~~~~~~~
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestChangeInputToOutput,
        output: `
        class Test {
          @Output() readonly testEmitter = new EventEmitter<string>();
                    
        }
      `,
      },
    ],
  }),
];