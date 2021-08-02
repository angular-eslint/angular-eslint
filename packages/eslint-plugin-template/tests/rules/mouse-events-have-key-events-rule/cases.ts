import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';

export const valid = [
  {
    filename: 'test.component.html',
    code: '<div (mouseover)="onMouseOver()" (focus)="onFocus()"></div>',
  },
  {
    filename: 'test.component.html',
    code: '<div (mouseout)="onMouseOut()" (blur)="onBlur()"></div>',
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when mouseover is not accompanied with focus',
    annotatedSource: `
        <div (mouseover)="onMouseOver()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: 'mouseOverEventHasFocusEvent',
    annotatedOutput: `
        <div (mouseover)="onMouseOver()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when mouseout is not accompanied with blur',
    annotatedSource: `
        <div (mouseout)="onMouseOut()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: 'mouseOutEventHasBlurEvent',
    annotatedOutput: `
        <div (mouseout)="onMouseOut()"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
];
