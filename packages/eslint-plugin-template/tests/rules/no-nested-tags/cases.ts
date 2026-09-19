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
  {
    code: '<A></A><A></A>',
    settings: {
      hideFromDocs: true,
    },
  },
  '<p></p>',
  '<p></p><p></p>',
  // Explicit <ng-template> is not rendered in the parent DOM, so nested
  // <p>/<a> tags inside it are not actually nested for hydration purposes.
  `
    <p>
      Text
      <ng-template #content>
        <p>Text</p>
      </ng-template>
    </p>
  `,
  {
    code: '<a><ng-template><a></a></ng-template></a>',
    settings: {
      hideFromDocs: true,
    },
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on a nested tag',
    annotatedSource: `
        <a><a></a></a>
           ~~~~~~~
      `,
    data: { tag: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on nested uppercase tag',
    annotatedSource: `
        <a><A></A></a>
           ~~~~~~~
      `,
    data: { tag: 'A' },
    settings: {
      hideFromDocs: true,
    },
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
    description: 'should fail on nested tag with a structural directive',
    annotatedSource: `
        <a><a *ngFor="let item of items"></a></a>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { tag: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail on nested p tag inside ng-container',
    annotatedSource: `
        <p><ng-container><p></p></ng-container></p>
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
