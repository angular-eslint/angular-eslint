import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-autofocus';
import rule, { RULE_NAME } from '../../src/rules/no-autofocus';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const messageId: MessageIds = 'noAutofocus';

ruleTester.run(RULE_NAME, rule, {
  valid: [`<input type="text" />`],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when autofocus attribute supplied',
      annotatedSource: `
        <textarea autofocus></textarea>
                  ~~~~~~~~~
      `,
      annotatedOutput: `
        <textarea></textarea>
                  ~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when autofocus attribute binding supplied',
      annotatedSource: `
        <div [attr.autofocus]="false">Autofocus</div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      annotatedOutput: `
        <div>Autofocus</div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
