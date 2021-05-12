import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-positive-tabindex';
import rule, { RULE_NAME } from '../../src/rules/no-positive-tabindex';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'noPositiveTabindex';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<span tabindex="-1"></span>',
    '<span tabindex="0"></span>',
    '<span [attr.tabindex]="-1"></span>',
    '<span [attr.tabindex]="0"></span>',
    '<span [attr.tabindex]="tabIndex"></span>',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when tabindex attr is positive',
      annotatedSource: `
        <div tabindex="5"></div>
             ~~~~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when tabindex input is positive',
      annotatedSource: `
        <div [attr.tabindex]="1"></div>
             ~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
  ],
});
