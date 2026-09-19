import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/mouse-events-have-key-events';

const messageId: MessageIds = 'mouseEventsHaveKeyEvents';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<app-test (mouseover)="onMouseOver()"></app-test>',
  '<app-test (mouseout)="onMouseOut()"></app-test>',
  '<div (mouseover)="onMouseOver()" (focus)="onFocus()"></div>',
  '<div (mouseout)="onMouseOut()" (blur)="onBlur()"></div>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
