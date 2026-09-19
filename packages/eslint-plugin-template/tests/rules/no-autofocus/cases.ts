import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-autofocus';

const messageId: MessageIds = 'noAutofocus';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<input type="text">',
  '<textarea autoFocus></textarea>',
  '<div [autoFocus]="true"></div>',
  '<button [appautofocus]="false">Click me!</button>',
  '<app-drag-drop autofocus></app-drag-drop>',
  '<app-textarea [autofocus]="false"></app-textarea>',
  // Dialog elements - autofocus is recommended for accessibility
  '<dialog autofocus></dialog>',
  '<dialog><button autofocus>Close</button></dialog>',
  '<dialog><form><input autofocus type="text"></form></dialog>',
  '<dialog [attr.autofocus]="true"></dialog>',
  '<dialog><button [attr.autofocus]="true">Close</button></dialog>',
  // Nested elements within dialog
  '<dialog><div><button autofocus>Action</button></div></dialog>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an `autofocus` attribute is present',
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
    description: 'should fail if an `autofocus` attribute binding is present',
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
    description: 'should fail if an `autofocus` input binding is present',
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
