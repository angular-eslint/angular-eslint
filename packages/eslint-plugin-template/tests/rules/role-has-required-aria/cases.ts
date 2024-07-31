import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/role-has-required-aria';

const messageId: MessageIds = 'roleHasRequiredAria';
const suggestRemoveRole: MessageIds = 'suggestRemoveRole';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<span role="checkbox" aria-checked="false"></span>',
  '<input type="checkbox" role="switch">',
  '<span role="heading" aria-level="5"></span>',
  '<span role="button"></span>',
  '<app-component [role]="ADMIN"></app-component>',
  '<summary (click)="onClick()">Foo</summary>',
  '<summary (click)="onClick()" aria-expanded="false">Bar</summary>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if role does not have required aria properties',
    annotatedSource: `
        <div role="combobox"></div>
             ~~~~~~~~~~~~~~~
      `,
    messageId,
    data: {
      element: 'div',
      role: 'combobox',
      missingProps: ['aria-controls', 'aria-expanded'].join(', '),
    },
    suggestions: [
      {
        messageId: suggestRemoveRole,
        output: `
        <div></div>
             
      `,
      },
    ],
  }),
];
