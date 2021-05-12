import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/accessibility-table-scope';
import rule, { RULE_NAME } from '../../src/rules/accessibility-table-scope';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'accessibilityTableScope';

ruleTester.run(RULE_NAME, rule, {
  valid: ['<th></th>', '<th scope="col"></th>', '<th [attr.scope]="col"></th>'],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when element other than th has scope',
      annotatedSource: `
        <div scope></div>
             ~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when element other than th has scope input',
      annotatedSource: `
        <div [attr.scope]="scope"></div>
             ~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
