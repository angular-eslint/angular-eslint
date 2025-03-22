import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-output-emitter-ref';

const messageIdPreferOutputEmitterRef: MessageIds = 'preferOutputEmitterRef';

export const valid = [
  `
    class Test {
      change = outputValue();
    }
    `,
  `
    class Test {
      change = new EventEmitter();
    }
    `,
  `
    class Test {
      readonly change = output();
    }
    `,
  `
    class Test {
      readonly change = output<string>();
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
];
