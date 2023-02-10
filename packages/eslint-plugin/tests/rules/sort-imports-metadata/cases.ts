import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-imports-metadata';

const messageId: MessageIds = 'sortImportsMetadata';

export const valid = [
  // TODO: Add valid cases
  `
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports` for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [aModule, bModule, dModule, cModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [aModule, bModule, cModule, dModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestComponent { }
    `,
  }),
  // TODO: Add more invalid cases
];
