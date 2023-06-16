import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageId } from '../../../src/rules/headings-consecutive-order';

const messageId: MessageId = 'headingsOrder';

export const valid = [
  // valid examples from https://www.w3.org/WAI/tutorials/page-structure/headings/
  {
    // organize passages on text
    code: `<h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h2>Heading 2</h2>
            <h2>Heading 2</h2>`,
  },
  {
    // Main heading before navigation
    code: `<h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h3>Heading 3</h3>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <div>valid</div>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>`,
  },
  {
    // Main heading after navigation
    code: `<h2>Heading 2</h2>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h3>Heading 3</h3>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h2>Heading 2</h2>`,
  },
  {
    // Ignore headings within <ng-template>
    code: `<h2>Heading 2</h2>
            <ng-template>
                <div>valid</div>
                <h6>ignore</h6>
            </ng-template>
            <h3>Heading 3</h3>`,
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if headings do not follow consecutive order',
    annotatedSource: `
      <h2>Heading 2</h2>
      <h4>Heading 4</h4>
      ~~~~~~~~~~~~~~~~~~
    `,
  }),
];
