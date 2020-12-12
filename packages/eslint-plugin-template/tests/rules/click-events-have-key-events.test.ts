import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/click-events-have-key-events';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'clickEventsHaveKeyEvents';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<div (click)="onClick()" (keyup)="onKeyup()"></div>',
    '<div (click)="onClick()" (keyup.enter)="onKeyup()"></div>',
    '<cui-button (click)="onClick()"></cui-button>',
    '<div (click)="onClick()" aria-hidden="true"></div>',
    '<div (click)="onClick()" [attr.aria-hidden]="true"></div>',
    '<div (click)="onClick()" [attr.aria-hidden]="ariaHidden"></div>',
    '<div (click)="onClick()" role="presentation"></div>',
    `<div (click)="onClick()" [attr.role]="'none'"></div>`,
    '<div (click)="onClick()" [attr.role]="roleName"></div>',
    '<input (click)="onClick()">',
    '<button (click)="onClick()"></button>',
    '<textarea (click)="onClick()"></textarea>',
    `
    <select (click)="onClick()">
      <option (click)="onClick()"></option>
    </select>
    `,
    '<textarea (click)="onClick()"></textarea>',
    '<a href="#" (click)="onClick()"></a>',
    '<a [attr.href]="href" class="anchor" (click)="onClick()"></a>',
    `<a [routerLink]="'route'" (click)="onClick()"></a>`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when click is not accompanied with key events',
      annotatedSource: `
        <div (click)="onClick()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events on non interactive element',
      annotatedSource: `
        <header (click)="onClick()"></header>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events on interactive element without attributes that make them interactive',
      annotatedSource: `
        <a (click)="onClick()"></a>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events and has aria-hidden attribute as false',
      annotatedSource: `
        <div (click)="onClick()" aria-hidden="false"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events and has aria-hidden input as false',
      annotatedSource: `
        <div (click)="onClick()" [attr.aria-hidden]="'false'"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events and has role other than presentational',
      annotatedSource: `
        <div (click)="onClick()" role="header"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events and has aria-hidden attribute as false',
      annotatedSource: `
        <div (click)="onClick()" role="aside"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail when click is not accompanied with key events and has role other than presentational',
      annotatedSource: `
        <div (click)="onClick()" [attr.role]="'header'"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
