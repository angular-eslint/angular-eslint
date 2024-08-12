import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-distracting-elements';

const messageId: MessageIds = 'noDistractingElements';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<div>Valid</div>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if `marquee` is used',
    annotatedSource: `
        <marquee></marquee>{{ test }}
        ~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'marquee' },
    annotatedOutput: `
        {{ test }}
        
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if `blink` is used',
    annotatedSource: `
        <div></div><blink></blink>
                   ~~~~~~~~~~~~~~~
      `,
    data: { element: 'blink' },
    annotatedOutput: `
        <div></div>
                   
      `,
  }),
];
