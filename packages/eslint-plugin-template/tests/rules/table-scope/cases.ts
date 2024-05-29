import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/table-scope';

const messageId: MessageIds = 'tableScope';

export const valid = [
  '<th></th>',
  '<th scope="col"></th>',
  `<th [scope]="'col'"></th>`,
  '<th [attr.scope]="scope"></th>',
  '<div Scope="col"></div>',
  '<button [appscope]="col"></button>',
  '<app-table scope></app-table>',
  '<app-row [scope]="row"></app-row>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `scope` attribute is not on `th` element',
    annotatedSource: `
        {{ test }}<div scope></div>
                       ~~~~~
      `,
    messageId,
    annotatedOutput: `
        {{ test }}<div></div>
                       
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `scope` input is not on `th` element',
    annotatedSource: `
        <div [attr.scope]="scope"></div><p></p>
             ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <div></div><p></p>
             
      `,
  }),
];
