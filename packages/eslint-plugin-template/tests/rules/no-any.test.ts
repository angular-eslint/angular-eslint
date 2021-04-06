import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-any';
import rule, { RULE_NAME } from '../../src/rules/no-any';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'noAny';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
      {{ $any }}
    `,
    `
      {{ obj.$any() }}
    `,
    `
      {{ obj?.x?.y!.z!.$any() }}
    `,
    `
      <a [href]="$test()">Click here</a>
    `,
    `
      <button type="button" (click)="anyClick()">Click here</button>
    `,
    `
      {{ $any }}
      {{ obj?.x?.y!.z!.$any() }}
      <a [href]="$test()">Click here</a>
      <button type="button" (click)="anyClick()">Click here</button>
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression in expression binding',
      annotatedSource: `
      {{ $any(framework).name }}
         ~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression using "this"',
      annotatedSource: `
      {{ this.$any(framework).name }}
         ~~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression in property binding',
      annotatedSource: `
      <a [href]="$any(getHref())">Click here</a>
                 ~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail for multiple cases',
      annotatedSource: `
        {{ $any(framework).name }}
           ~~~~~~~~~~~~~~~
       <div>
        {{ this.$any(framework).name }}
           ^^^^^^^^^^^^^^^^^^^^
        </div>
        <a [href]="$any(getHref())">Click here</a>'
                   ###############
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
        { char: '#', messageId },
      ],
    }),
  ],
});
