import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-nested-tags';

const messageId: MessageIds = 'noNestedTags';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<a></a>',
  '<a></a><a></a>',
  '<p></p>',
  '<p></p><p></p>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on nested a tag',
    annotatedSource: `
        <a><a></a></a>
           ~~~~~~~
      `,
    data: { tag: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on nested p tag',
    annotatedSource: `
        <p>@if(true) {<p></p>}</p>
                      ~~~~~~~
      `,
    data: { tag: 'p' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on arbitrary depth',
    annotatedSource: `
        <a>${'<div>'.repeat(20)}
          <a>fail</a>
          ~~~~~~~~~~~
        ${'</div>'.repeat(20)}</a>
      `,
    data: { tag: 'a' },
  }),
];
