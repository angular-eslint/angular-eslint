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
    '<div ariaselected="0"></div>',
    '<textarea [attr.aria-readonly]="readonly"></textarea>',
    '<button [variant]="variant">Text</button>',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if the attribute is an invalid ARIA attribute',
      annotatedSource: `
        <div aria-roledescriptio="text">Text</div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~
        <input [aria-labelby]="label">
               ^^^^^^^^^^^^^^^^^^^^^^               
        <input [attr.aria-requiredIf]="required">
               #################################
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
        { char: '#', messageId },
      ],
    }),
  ],
});
