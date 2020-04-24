import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-call-expression';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'noCallExpression';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
      {{ info }}
    `,
    `
      <button type="button" (click)="handleClick()">Click Here</button>
    `,
    `
      {{ $any(info) }}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression in expression binding',
      annotatedSource: `
        <div>{{ getInfo() }}</div>
                ~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression in expression binding',
      annotatedSource: `
        <a href="http://example.com">{{ getInfo() }}</a>
                                        ~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail when using a property resulted from a call expression in expression binding',
      annotatedSource: `
        <a href="http://example.com">{{ getInfo().name }}</a>
                                        ~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with call expression in property binding',
      annotatedSource: `
        <a [href]="getUrl()">info</a>
                   ~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail with a property access call expression',
      annotatedSource: `
        <a [href]="helper.getUrl()">info</a>
                   ~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
  ],
});
