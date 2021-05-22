import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/accessibility-valid-aria';
import rule, { RULE_NAME } from '../../src/rules/accessibility-valid-aria';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const accessibilityValidAria: MessageIds = 'accessibilityValidAria';
const accessibilityValidAriaValue: MessageIds = 'accessibilityValidAriaValue';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
      <input aria-labelledby="Text">
      <div ariaselected="0"></div>
      <textarea [attr.aria-readonly]="readonly"></textarea>
      <button [variant]="variant">Text</button>
      <div aria-expanded="true">aria-expanded</div>
      <div aria-haspopup="menu">aria-haspopup</div>
      <div [attr.aria-pressed]="undefined">aria-pressed</div>
      <input [attr.aria-rowcount]="2">
      <div aria-relevant="additions">additions</div>
      <div aria-checked="false">checked</div>
      <div role="slider" [aria-valuemin]="1"></div>
      <input
        aria-placeholder="Placeholder"
        aria-orientation="undefined"
        [attr.aria-checked]="test && isChecked"
        [attr.aria-hidden]="'abc' | appAria"
        [attr.aria-invalid]="hasError ? 'grammar' : 'spelling'"
        [attr.aria-label]="inputSchema!.label"
        [attr.aria-live]="inputSchema['live']"
        [attr.aria-required]="inputSchema?.isRequired">
    `,
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
        {
          char: '~',
          messageId: accessibilityValidAria,
          data: { attribute: 'aria-roledescriptio' },
        },
        {
          char: '^',
          messageId: accessibilityValidAria,
          data: { attribute: 'aria-labelby' },
        },
        {
          char: '#',
          messageId: accessibilityValidAria,
          data: { attribute: 'aria-requiredIf' },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if the ARIA attribute has an invalid value',
      annotatedSource: `
        <div aria-expanded="notABoolean">notABoolean</div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        <div aria-haspopup="notAToken">notAToken</div>
             ^^^^^^^^^^^^^^^^^^^^^^^^^
        <input [attr.aria-rowcount]="{ a: 2 }">notAnInteger
               ###############################
        <div aria-relevant="notATokenList">notATokenList</div>
             %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        <div aria-checked="notATristate">notATristate</div>
             ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
        <div role="slider" [attr.aria-valuemin]="[1, 2]">notANumber</div>
                           ¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨
        <input [attr.aria-placeholder]="4">notAPlaceholder
               @@@@@@@@@@@@@@@@@@@@@@@@@@@
      `,
      messages: [
        {
          char: '~',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-expanded' },
        },
        {
          char: '^',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-haspopup' },
        },
        {
          char: '#',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-rowcount' },
        },
        {
          char: '%',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-relevant' },
        },
        {
          char: '¶',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-checked' },
        },
        {
          char: '¨',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-valuemin' },
        },
        {
          char: '@',
          messageId: accessibilityValidAriaValue,
          data: { attribute: 'aria-placeholder' },
        },
      ],
    }),
  ],
});
