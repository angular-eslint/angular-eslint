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
      <button type="button" (click)="handleClick()">Click Here</button>
      {{ $any(info) }}
      <input (change)="obj?.changeHandler()">
      <form [formGroup]="form" (ngSubmit)="form.valid || save()"></form>
      <form [formGroup]="form" (ngSubmit)="form.valid && save()"></form>
      <form [formGroup]="form" (ngSubmit)="id ? save() : edit()"></form>
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail for call expression in an expression binding',
      annotatedSource: `
        <div>{{ getInfo() }}</div>
                ~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail when using a property resulted from a call expression in an expression binding',
      annotatedSource: `
        <a href="http://example.com">{{ getInfo().name }}</a>
                                        ~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail for call expression in a property binding',
      annotatedSource: `
        <a [href]="getUrl()">info</a>
                   ~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail for call expression with binaries',
      annotatedSource: `
        <a [href]="id && createUrl()">info</a>
                         ~~~~~~~~~~~
        {{ id || obj?.nested1() }}
                 ^^^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail for call expression within conditionals',
      annotatedSource: `
        <a [href]="id ? a?.createUrl() : editUrl()">info</a>
                        ~~~~~~~~~~~~~~   ^^^^^^^^^
        {{ 1 === 2 ? 3 : obj?.nested1() }}
                         ##############
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
        { char: '#', messageId },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail for safe/unsafe method calls',
      annotatedSource: `
        {{ obj?.nested1() }} {{ obj!.nested1() }}
           ~~~~~~~~~~~~~~       ^^^^^^^^^^^^^^
        <button [type]="obj!.$any(b)!.getType()">info</button>
                        #######################
        <a [href]="obj.propertyA?.href()">info</a>
                   %%%%%%%%%%%%%%%%%%%%%
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
        { char: '#', messageId },
        { char: '%', messageId },
      ],
    }),
  ],
});
