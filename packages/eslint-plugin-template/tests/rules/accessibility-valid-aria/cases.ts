import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/accessibility-valid-aria';

const accessibilityValidAria: MessageIds = 'accessibilityValidAria';
const accessibilityValidAriaValue: MessageIds = 'accessibilityValidAriaValue';
const suggestRemoveInvalidAria: MessageIds = 'suggestRemoveInvalidAria';

export const valid = [
  '<input aria-labelledby="Text">',
  '<div ariaselected="0"></div>',
  '<textarea [attr.aria-readonly]="readonly"></textarea>',
  '<button [variant]="variant">Text</button>',
  '<div aria-expanded="true">aria-expanded</div>',
  '<div aria-haspopup="menu">aria-haspopup</div>',
  '<div [attr.aria-pressed]="undefined">aria-pressed</div>',
  '<input [attr.aria-rowcount]="2">',
  '<div aria-relevant="additions">additions</div>',
  '<div aria-checked="false">checked</div>',
  '<div role="slider" [aria-valuemin]="1"></div>',
  '<div aria-="text">Text</div>',
  `
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
  '<app-custom aria-x="text">Text</app-custom>',
  '<app-test aria-expanded="notABoolean"></app-test>',
];

export const invalid = [
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
        suggestions: [
          {
            messageId: suggestRemoveInvalidAria,
            data: { attribute: 'aria-roledescriptio' },
            output: `
        <div>Text</div>
                                       
        <input [aria-labelby]="label">
                                     
        <input [attr.aria-requiredIf]="required">
               
      `,
          },
        ],
      },
      {
        char: '^',
        messageId: accessibilityValidAria,
        data: { attribute: 'aria-labelby' },
        suggestions: [
          {
            messageId: suggestRemoveInvalidAria,
            data: { attribute: 'aria-labelby' },
            output: `
        <div aria-roledescriptio="text">Text</div>
                                       
        <input>
                                     
        <input [attr.aria-requiredIf]="required">
               
      `,
          },
        ],
      },
      {
        char: '#',
        messageId: accessibilityValidAria,
        data: { attribute: 'aria-requiredIf' },
        suggestions: [
          {
            messageId: suggestRemoveInvalidAria,
            data: { attribute: 'aria-requiredIf' },
            output: `
        <div aria-roledescriptio="text">Text</div>
                                       
        <input [aria-labelby]="label">
                                     
        <input>
               
      `,
          },
        ],
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
];
