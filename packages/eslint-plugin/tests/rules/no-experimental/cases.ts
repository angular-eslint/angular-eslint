import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-experimental';

const messageId: MessageIds = 'noExperimental';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    /** Not experimental */
    interface Test {};
    const test: Test = {};
 `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if experimental functionality is used',
    annotatedSource: `
        /** @experimental */
        interface Test {};
        const test: Test = {};
                    ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
];
