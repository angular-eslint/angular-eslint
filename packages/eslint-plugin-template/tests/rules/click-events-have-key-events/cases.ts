import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/click-events-have-key-events';

const messageId: MessageIds = 'clickEventsHaveKeyEvents';

export const valid = [
  {
    // It should work when click events are associated with key events.
    code: '<div (click)="onClick()" (keyup)="onKeyup()"></div>',
  },
  {
    // It should work when click events are associated with key pseudo events.
    code: '<div (click)="onClick()" (keyup.enter)="onKeyup()"></div>',
  },
  {
    // It should work when click events are passed to custom element.
    code: '<cui-button (click)="onClick()"></cui-button>',
  },
  {
    // It should work when element has a static value for aria-hidden.
    code: `
        <div (click)="onClick()" aria-hidden></div>
        <div (click)="onClick()" aria-hidden="true"></div>
        <div (click)="onClick()" [attr.aria-hidden]="true"></div>
      `,
  },
  {
    // It should work when element has presentation role.
    code: `
        <div (click)="onClick()" role="presentation"></div>
        <div (click)="onClick()" [attr.role]="'none'"></div>
      `,
  },
  {
    // It should work when element is interactive.
    code: `
        <input (click)="onClick()">
        <button (click)="onClick()"></button>
        <textarea (click)="onClick()"></textarea>
        <select (click)="onClick()">
          <option (click)="onClick()"></option>
        </select>
        <textarea (click)="onClick()"></textarea>
        <a href="#" (click)="onClick()"></a>
        <a [attr.href]="href" class="anchor" (click)="onClick()"></a>
        <a [routerLink]="'route'" (click)="onClick()"></a>
      `,
  },
];

export const invalid = [
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
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when aria-hidden is set dynamically via a property binding',
    annotatedSource: `
      <div (click)="onClick()" [attr.aria-hidden]="ariaHidden"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when hidden is set dynamically via a property binding',
    annotatedSource: `
      <div (click)="onClick()" [attr.hidden]="hidden"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
  }),
];
