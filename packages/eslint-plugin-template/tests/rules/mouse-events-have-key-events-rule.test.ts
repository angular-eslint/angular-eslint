import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  RULE_NAME,
} from '../../src/rules/mouse-events-have-key-events-rule';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      filename: 'test.component.html',
      code: '<div (mouseover)="onMouseOver()" (focus)="onFocus()"></div>',
    },
    {
      filename: 'test.component.html',
      code: '<div (mouseout)="onMouseOut()" (blur)="onBlur()"></div>',
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when mouseover is not accompanied with focus',
      annotatedSource: `
        <div (mouseover)="onMouseOver()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId: 'mouseOverEventHasFocusEvent',
      annotatedOutput: `
        <div (mouseover)="onMouseOver()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when mouseout is not accompanied with blur',
      annotatedSource: `
        <div (mouseout)="onMouseOut()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId: 'mouseOutEventHasBlurEvent',
      annotatedOutput: `
        <div (mouseout)="onMouseOut()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
