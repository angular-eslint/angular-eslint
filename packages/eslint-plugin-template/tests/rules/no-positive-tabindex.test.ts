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
const suggestNonNegativeTabindex: MessageIds = 'suggestNonNegativeTabindex';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<span></span>',
    '<span id="2"></span>',
    '<span tabindex></span>',
    '<span tabindex="-1"></span>',
    '<span tabindex="0"></span>',
    '<span [attr.tabindex]="-1"></span>',
    '<span [attr.tabindex]="0"></span>',
    '<span [attr.tabindex]="tabIndex"></span>',
    '<span [attr.tabindex]="null"></span>',
    '<span [attr.tabindex]="undefined"></span>',
    '<app-test [tabindex]="1"></app-test>',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if `tabindex` attribute is positive',
      annotatedSource: `
        <div tabindex="5"></div>
                       ~
      `,
      messageId,
      suggestions: [
        {
          messageId: suggestNonNegativeTabindex,
          output: `
        <div tabindex="-1"></div>
                       
      `,
          data: { tabindex: '-1' },
        },
        {
          messageId: suggestNonNegativeTabindex,
          output: `
        <div tabindex="0"></div>
                       
      `,
          data: { tabindex: '0' },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if `tabindex` input is positive',
      annotatedSource: `
        <div [attr.tabindex]="21"></div>
                              ~~
      `,
      messageId,
      suggestions: [
        {
          messageId: suggestNonNegativeTabindex,
          output: `
        <div [attr.tabindex]="-1"></div>
                              
      `,
          data: { tabindex: '-1' },
        },
        {
          messageId: suggestNonNegativeTabindex,
          output: `
        <div [attr.tabindex]="0"></div>
                              
      `,
          data: { tabindex: '0' },
        },
      ],
    }),
  ],
});
