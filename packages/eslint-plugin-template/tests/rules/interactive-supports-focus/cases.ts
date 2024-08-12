import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/interactive-supports-focus';

const messageId: MessageIds = 'interactiveSupportsFocus';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // no interactive outputs
  { code: '<div></div>' },

  // aria-hidden
  {
    code: `
      <div aria-hidden (click)="onClick()"></div>
      <div aria-hidden="true" (click)="onClick()"></div>
      <div [attr.aria-hidden]="true" (click)="onClick()"></div>
    `,
  },

  // aria-disabled
  {
    code: `
      <div role="button" aria-disabled="true" (click)="onClick()"></div>
      <div role="button" [attr.aria-disabled]="true" (click)="onClick()"></div>
    `,
  },

  // presentation role
  {
    code: `
      <div role="presentation" (click)="onClick()"></div>
      <div role="none" (click)="onClick()"></div>
    `,
  },

  // explicitly assigned not interactive role
  {
    code: `
      <div role="progressbar" (click)="onClick()"></div>
      <div role="region" (click)="onClick()"></div>
    `,
  },

  // hidden input is not interactive, tabindex is not required
  {
    code: `
      <input type="hidden" (click)="onClick()">
      <input type="hidden" (click)="onClick()" tabindex="-1">
      <input type="hidden" (click)="onClick()" [attr.tabindex]="-1">
    `,
  },

  // interactive elements
  {
    code: `
      <input type="text" (keyup)="onKeyUp()">
      <input (keydown)="onKeydown()">
      <input (click)="onClick()" role="combobox">
      <button (click)="onClick()" class="foo">Foo</button>
      <option (click)="onClick()" class="foo">Food</option>
      <select (click)="onClick()" class="foo"></select>
      <summary (click)="onClick()">Foo</summary>
      <textarea (keypress)="onKeypress()" class="foo"></textarea>
    `,
  },

  // disabled
  {
    code: `
      <input disabled type="text" (click)="onClick()">
      <button disabled (click)="onClick()" class="foo">Foo</button>
      <select disabled (click)="onClick()" class="foo"></select>
    `,
  },

  // area without href needs tabindex for focus
  {
    code: `
      <area href="#" (click)="onClick()" class="foo"/>
      <area (click)="onClick()" tabindex=0 class="foo"/>
    `,
  },

  // a without href needs tabindex for focus
  {
    code: `
      <a (click)="onClick()" tabindex="0">Click me</a>
      <a (click)="onClick()" tabindex={{0}}>Click me</a>
      <a (click)="onClick()" [attr.tabindex]="0">Click me</a>
      <a (click)="onClick()" tabindex="bad">Click me</a>
      <a (click)="onClick()" [attr.tabindex]="undefined"}>Click me</a>
      <a (click)="onClick()" [attr.tabindex]="dynamicTabindex">Click me</a>
    `,
  },

  // interactive role with href and click
  { code: '<a role="button" (click)="onClick()" href="#">hash</a>' },
  // href and click
  {
    code: `
      <a (click)="onClick()" href="http://x.y.z">x.y.z</a>
      <a role="link" (click)="onClick()" href="http://x.y.z">x.y.z</a>
      <a (click)="onClick()" href="javascript:void(0);">Click ALL the things!</a>
    `,
  },

  // routerLink
  {
    code: `
      <a routerLink="route" (click)="onClick()"></a>
      <a [routerLink]="route" (click)="onClick()"></a>
    `,
  },

  // invalid tabindex
  {
    code: `
      <div (click)="onClick()" tabindex="invalid"></div>
      <div (click)="onClick()" [attr.tabindex]="undefined"></div>
      <span (click)="onClick()" [attr.tabindex]=="false">Submit</span>
      <span (click)="onClick()" [attr.tabindex]=="null">Submit</span>
    `,
  },

  // valid tabindex
  {
    code: `
      <span (click)="onClick()" tabindex="0">Click me!</span>
      <span (click)="onClick()" [attr.tabindex]="0">Click me!</span>
      <span (click)="onClick()" tabindex="-1">Click me!</span>
      <span (click)="onClick()" [attr.tabindex]="-1">Click me!</span>
    `,
  },

  // interactive role with tabindex
  {
    code: `
      <div role="button" tabindex="0" (click)="onClick()"></div>
      <div role="checkbox" tabindex="0" (click)="onClick()"></div>
      <div role="link" tabindex="0" (click)="onClick()"></div>
      <div role="menuitem" tabindex="0" (click)="onClick()"></div>
      <div role="checkbox" tabindex="0" (click)="onClick()"></div>
      <div role="menuitem" tabindex="0" (click)="onClick()"></div>
      <div role="option" tabindex="0" (click)="onClick()"></div>
      <div role="radio" tabindex="0" (click)="onClick()"></div>
      <div role="spinbutton" tabindex="0" (click)="onClick()"></div>
      <div role="switch" tabindex="0" (click)="onClick()"></div>
      <div role="tablist" tabindex="0" (click)="onClick()"></div>
      <div role="tab" tabindex="0" (click)="onClick()"></div>
      <div role="textbox" tabindex="0" (click)="onClick()"></div>
    `,
  },

  // elements with contenteditable enabled are interactive by default
  {
    code: `
      <div contenteditable="true" (keyup)="onKeyUp()">Edit this text</div>
      <div [attr.contenteditable]="true" (keydown)="onKeyDown()">Edit this text</div>
      <div contenteditable (keypress)="onKeyPress()">Edit this too!</div>
    `,
  },

  // custom element, only HTML DOM elements are validated
  {
    code: `<test-component (keydown)="onKeyDown()"></test-component>`,
  },

  // allowList: by default the form element is allowed to support click and key event bubbling
  {
    code: `<form (keydown)="onKeyDown()"></form>`,
  },

  // allowList: allow click and key event bubbling on additional elements
  {
    code: `
      <form (keydown)="onKeyDown()"></form>
      <section (keydown)="onKeyDown()"></section>
    `,
    options: [
      {
        allowList: ['form', 'section'],
      },
    ],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  // aria-hidden="false"
  convertAnnotatedSourceToFailureCase({
    description: 'should fail not hidden from screen reader',
    annotatedSource: `
      <div aria-hidden="false" (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail not hidden from screen reader with bound aria-hidden attribute',
    annotatedSource: `
      <div [attr.aria-hidden]="false" (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  // aria-disabled="false"
  convertAnnotatedSourceToFailureCase({
    description: 'should fail aria-disabled is false',
    annotatedSource: `
      <div role="button" aria-disabled="false" (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail aria-disabled is false with bound attribute',
    annotatedSource: `
      <div [attr.aria-disabled]="false" (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // interactive role, non interactive element
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail interactive role but element does not support focus',
    annotatedSource: `
      <div role="button" (click)="onClick()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // no role, non interactive element
  convertAnnotatedSourceToFailureCase({
    description: 'should fail non-interactive element does not support focus',
    annotatedSource: `
      <span (click)="onClick()">Submit</span>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element with aria-label does not support focus',
    annotatedSource: `
      <div (click)="onClick()" [attr.aria-label]="clickableThing"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // invalid role, non interactive element
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element with invalid role does not support focus',
    annotatedSource: `
      <div (click)="onClick()" role="invalid"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: {
      role: 'invalid',
    },
  }),

  // area and a are not interactive without href
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element does not support focus, area should have href',
    annotatedSource: `
      <area (click)="onClick()" class="foo">
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element does not support focus, anchor should have href',
    annotatedSource: `
      <a (click)="onClick()">Click me</a>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // non-interactive element with keyup, keydown, keypress interaction handlers
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element with key event does not support focus',
    annotatedSource: `
      <div (keyup)="onKeyUp()" (keydown)="onKeyDown()" (keypress)="onKeyPress()">Cannot be focused</div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // contenteditable="false"
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail non-interactive element with contenteditable disabled does not support focus',
    annotatedSource: `
      <div [attr.contenteditable]="false" (keyup)="onKeyUp()">Cannot be focused</div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),

  // allowList empty
  convertAnnotatedSourceToFailureCase({
    description:
      'allowList as an empty array allows only HTML elements that can directly receive focus',
    annotatedSource: `
      <form (keydown)="onKeyDown()"></form>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [
      {
        allowList: [],
      },
    ],
    messageId,
  }),
];
