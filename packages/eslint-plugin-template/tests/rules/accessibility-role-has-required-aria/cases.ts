import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/accessibility-role-has-required-aria';

const messageId: MessageIds = 'roleHasRequiredAria';
const suggestRemoveRole: MessageIds = 'suggestRemoveRole';

export const valid = [
  '<span role="checkbox" aria-checked="false"></span>',
  '<input type="checkbox" role="switch">',
  '<span role="heading" aria-level="5"></span>',
  '<span role="button"></span>',
  '<app-component [role]="ADMIN"></app-component>',
];

export const invalid = [
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
