import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-developer-preview';

const messageId: MessageIds = 'noDeveloperPreview';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    /** Not in developerPreview */
    interface Test {};
    const test: Test = {};
 `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if developer preview functionality is used',
    annotatedSource: `
        /** @developerPreview */
        interface Test {};
        const test: Test = {};
                    ~~~~
`,
    messageId,
  }),
];
