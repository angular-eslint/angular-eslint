import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/click-events-have-key-events';

const messageId: MessageIds = 'clickEventsHaveKeyEvents';

export const valid = [
  // should pass if element has `click` event and accessibility events
  '<div (click)="onClick()" (keyup)="onKeyup()"></div>',
  // should pass if element has `click` event and pseudo accessibility events
  '<div (click)="onClick()" (keypress.enter)="onKeypress()"></div>',
  // should pass if element has `click` event and complex pseudo accessibility events
  '<div (click)="onClick()" (keydown.shift.f)="onKeydown()"></div>',
  // should pass if element is a custom element
  '<cui-button (click)="onClick()"></cui-button>',
  // should pass if element has `click` event and although it doesn't have accessibility events, it is hidden from screen reader
  `
    <div (click)="onClick()" hidden></div>
    <div style="display: none">
      <header (click)="onClick()"></header>
    </div>
    <div (click)="onClick()" [style.display.none]="true"></div>
    <div (click)="onClick()" [ngStyle]="{visibility: 'hidden'}"></div>
    <div (click)="onClick()" aria-hidden></div>
    <div (click)="onClick()" aria-hidden="true"></div>
    <div (click)="onClick()" [attr.aria-hidden]="true"></div>
    <div (click)="onClick()" [attr.aria-hidden]="'true'"></div>
  `,
  // should pass if element has `click` event and although it doesn't have accessibility events, it is has a presentation-like role
  `
    <div (click)="onClick()" role="presentation"></div>
    <div (click)="onClick()" [attr.role]="'none'"></div>
  `,
  // should pass if element has `click` event and although it doesn't have accessibility events, it is is interactive (and fulfill all the necessary attributes)
  `
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a non-interactive element has `click` event, but not accessibility events',
    annotatedSource: `
      <div (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an interactive element (without attributes that make it interactive) has `click` event, but not accessibility events',
    annotatedSource: `
      <a (click)="onClick()"></a>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a non-interactive element has `click` event and its `aria-hidden` attribute is set to `false`',
    annotatedSource: `
      <div (click)="onClick()" aria-hidden="false"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a non-interactive element has `click` event and its `aria-hidden` input is set to a `PropertyRead`',
    annotatedSource: `
      <div (click)="onClick()" [attr.aria-hidden]="ariaHidden"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a non-interactive element has `click` event and its `role` attribute is not presentation-like',
    annotatedSource: `
      <div (click)="onClick()" role="header"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an interactive element (without attributes that make it interactive) has `click` event and its `role` input is not presentation-like',
    annotatedSource: `
      <a (click)="onClick()" [attr.role]="'header'"></a>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a non-interactive element has `click` event and its `role` input is a `PropertyRead`',
    annotatedSource: `
      <div (click)="onClick()" [role]="role"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
];
