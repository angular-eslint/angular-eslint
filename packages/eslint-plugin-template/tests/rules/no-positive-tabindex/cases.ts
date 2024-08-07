import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-positive-tabindex';

const messageId: MessageIds = 'noPositiveTabindex';
const suggestNonNegativeTabindex: MessageIds = 'suggestNonNegativeTabindex';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
];
