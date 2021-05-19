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
      description: 'should fail if `scope` attribute is not on `th` element',
      annotatedSource: `
        {{ test }}<div scope></div>
                       ~~~~~
      `,
      annotatedOutput: `
        {{ test }}<div></div>
                       
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if `scope` input is not on `th` element',
      annotatedSource: `
        <div [attr.scope]="scope"></div><p></p>
             ~~~~~~~~~~~~~~~~~~~~
      `,
      annotatedOutput: `
        <div></div><p></p>
             
      `,
    }),
  ],
});
