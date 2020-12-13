import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-distracting-elements';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'noDistractingElements';

ruleTester.run(RULE_NAME, rule, {
  valid: ['<div>Valid</div>'],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when distracting element marquee is used',
      annotatedSource: `
        <marquee></marquee>
        ~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when distracting element blink is used',
      annotatedSource: `
        <blink></blink>
        ~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
