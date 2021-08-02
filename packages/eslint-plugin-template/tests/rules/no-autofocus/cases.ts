import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-autofocus';

const messageId: MessageIds = 'noAutofocus';

export const valid = [
  '<input type="text">',
  '<textarea autoFocus></textarea>',
  '<div [autoFocus]="true"></div>',
  '<button [appautofocus]="false">Click me!</button>',
  '<app-drag-drop autofocus></app-drag-drop>',
  '<app-textarea [autofocus]="false"></app-textarea>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `autofocus` attribute is present',
    annotatedSource: `
        <button autofocus>Click me!</button>
                ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <button>Click me!</button>
                ~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `autofocus` attribute binding is present',
    annotatedSource: `
        <input [attr.autofocus]="false">
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <input>
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `autofocus` input binding is present',
    annotatedSource: `
        <app-test [autofocus]="true"></app-test>
        <select autofocus></select>
                ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <app-test [autofocus]="true"></app-test>
        <select></select>
                ~~~~~~~~~
      `,
  }),
];
