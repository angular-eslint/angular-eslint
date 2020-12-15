import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/accessibility-valid-aria';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'accessibilityValidAria';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<input aria-labelledby="Text">',
    '<input [attr.aria-labelledby]="text">',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when aria attributes are misspelled or if they does not exist',
      annotatedSource: `
        <input aria-labelby="text">
               ~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when using wrong aria attributes with inputs',
      annotatedSource: `
        <input [aria-labelby]="text">
               ~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
