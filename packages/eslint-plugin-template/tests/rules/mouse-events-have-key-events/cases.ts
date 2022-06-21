import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/mouse-events-have-key-events';

const messageId: MessageIds = 'mouseEventsHaveKeyEvents';

export const valid = [
  '<app-test (mouseover)="onMouseOver()"></app-test>',
  '<app-test (mouseout)="onMouseOut()"></app-test>',
  '<div (mouseover)="onMouseOver()" (focus)="onFocus()"></div>',
  '<div (mouseout)="onMouseOut()" (blur)="onBlur()"></div>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `mouseover` is not accompanied by `focus`',
    annotatedSource: `
      <div (mouseover)="onMouseOver()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: { keyEvent: 'focus', mouseEvent: 'mouseover' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `mouseout` is not accompanied by `blur`',
    annotatedSource: `
      <div (mouseout)="onMouseOut()" (focus)="onFocus()"></div>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    data: { keyEvent: 'blur', mouseEvent: 'mouseout' },
  }),
];
