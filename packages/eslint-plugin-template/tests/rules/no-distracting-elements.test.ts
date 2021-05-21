import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-distracting-elements';
import rule, { RULE_NAME } from '../../src/rules/no-distracting-elements';

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
      description: 'should fail if `marquee` is used',
      annotatedSource: `
        <marquee></marquee>{{ test }}
        ~~~~~~~~~~~~~~~~~~~
      `,
      annotatedOutput: `
        {{ test }}
        
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if `blink` is used',
      annotatedSource: `
        <div></div><blink></blink>
                   ~~~~~~~~~~~~~~~
      `,
      annotatedOutput: `
        <div></div>
                   
      `,
    }),
  ],
});
