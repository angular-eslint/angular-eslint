import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/valid-aria';

const accessibilityValidAria: MessageIds = 'validAria';
const accessibilityValidAriaValue: MessageIds = 'validAriaValue';
const suggestRemoveInvalidAria: MessageIds = 'suggestRemoveInvalidAria';
const invalidAttrBindingName: MessageIds = 'invalidAttrBindingName';
const suggestRenameAria: MessageIds = 'suggestRenameAria';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<input aria-labelledby="Text">',
  '<div ariaselected="0"></div>',
  '<textarea [attr.aria-readonly]="readonly"></textarea>',
  '<button [variant]="variant">Text</button>',
  '<div aria-expanded="true">aria-expanded</div>',
  '<div aria-haspopup="menu">aria-haspopup</div>',
  '<div [attr.aria-pressed]="undefined">aria-pressed</div>',
  '<input [attr.aria-rowcount]="2">',
  '<table aria-rowcount="-1"></table>',
  '<div aria-relevant="additions">additions</div>',
  '<div aria-relevant="additions removals">additions removals</div>',
  '<div aria-relevant="additions text">the ARIA default value</div>',
  '<div aria-relevant="  additions   text  ">surrounding and repeated whitespace</div>',
  '<div aria-dropeffect="copy move">copy move</div>',
  '<div aria-checked="false">checked</div>',
  '<div role="slider" [attr.aria-valuemin]="1"></div>',
  '<div role="slider" aria-valuemin="1"></div>',
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
  '<div aria-checked="mixed">checked</div>',
  '<div aria-pressed="mixed">checked</div>',
  '<div [ariaLabel]="x"></div>',
  '<app-foo [ariaLabel]="x"></app-foo>',
  '<div attr.aria-label="{{x}}"></div>',
  '<div attr.aria-label="Close"></div>',
  '<div aria-Label="Close"></div>',
  '<div [attr.aria-Label]="label"></div>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
    description:
      'should fail if the attribute is an invalid ARIA attribute on an uppercase element',
    annotatedSource: `
        <INPUT [aria-labelby]="label">
               ^^^^^^^^^^^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '^',
        messageId: accessibilityValidAria,
        data: { attribute: 'aria-labelby' },
        suggestions: [
          {
            messageId: suggestRemoveInvalidAria,
            data: { attribute: 'aria-labelby' },
            output: `
        <INPUT>
               
      `,
          },
        ],
      },
    ],
    settings: {
      hideFromDocs: true,
    },
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a token list contains an unknown token, or holds no token at all',
    annotatedSource: `
        <div aria-relevant="additions notAToken">Text</div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        <div aria-dropeffect="copy notAToken">Text</div>
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        <div aria-relevant="   ">Text</div>
             ###################
      `,
    messages: [
      {
        char: '~',
        messageId: accessibilityValidAriaValue,
        data: { attribute: 'aria-relevant' },
      },
      {
        char: '^',
        messageId: accessibilityValidAriaValue,
        data: { attribute: 'aria-dropeffect' },
      },
      {
        char: '#',
        messageId: accessibilityValidAriaValue,
        data: { attribute: 'aria-relevant' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a camelCase ARIA name follows the `attr.` prefix',
    annotatedSource: `
        <div [attr.ariaLabel]="label"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: invalidAttrBindingName,
    data: { attribute: 'ariaLabel', suggested: 'aria-label' },
    suggestions: [
      {
        messageId: suggestRenameAria,
        data: { suggested: 'attr.aria-label' },
        output: `
        <div [attr.aria-label]="label"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a camelCase ARIA name follows the `attr.` prefix on a custom element',
    annotatedSource: `
        <app-foo [attr.ariaLabel]="x"></app-foo>
                 ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: invalidAttrBindingName,
    data: { attribute: 'ariaLabel', suggested: 'aria-label' },
    suggestions: [
      {
        messageId: suggestRenameAria,
        data: { suggested: 'attr.aria-label' },
        output: `
        <app-foo [attr.aria-label]="x"></app-foo>
                 
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should suggest the lowercase hyphenated name for multi-word camelCase ARIA names after `attr.`',
    annotatedSource: `
        <div [attr.ariaDescribedBy]="x"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: invalidAttrBindingName,
    data: { attribute: 'ariaDescribedBy', suggested: 'aria-describedby' },
    suggestions: [
      {
        messageId: suggestRenameAria,
        data: { suggested: 'attr.aria-describedby' },
        output: `
        <div [attr.aria-describedby]="x"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail without a rename suggestion if a camelCase name after `attr.` does not hyphenate to a known ARIA attribute',
    annotatedSource: `
        <div [attr.ariaLabelby]="x"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: accessibilityValidAria,
    data: { attribute: 'ariaLabelby' },
    suggestions: [
      {
        messageId: suggestRemoveInvalidAria,
        data: { attribute: 'ariaLabelby' },
        output: `
        <div></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a bound `attr.` attribute has an unknown ARIA name',
    annotatedSource: `
        <div [attr.aria-labelby]="x"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: accessibilityValidAria,
    data: { attribute: 'aria-labelby' },
    suggestions: [
      {
        messageId: suggestRemoveInvalidAria,
        data: { attribute: 'aria-labelby' },
        output: `
        <div></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should lowercase the ARIA name of an uppercase bound `attr.` attribute before checking it',
    annotatedSource: `
        <div [attr.ARIA-labelx]="x"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: accessibilityValidAria,
    data: { attribute: 'ARIA-labelx' },
    suggestions: [
      {
        messageId: suggestRemoveInvalidAria,
        data: { attribute: 'ARIA-labelx' },
        output: `
        <div></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should check the value of a mixed-case ARIA attribute against its lowercase name',
    annotatedSource: `
        <div aria-Hidden="notABoolean"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: accessibilityValidAriaValue,
    data: { attribute: 'aria-Hidden' },
  }),
];
