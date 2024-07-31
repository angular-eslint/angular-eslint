import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-interpolation-in-attributes';

const messageId: MessageIds = 'noInterpolationInAttributes';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<input type="text" [name]="foo">',
  '<input type="text" name="foo" [(ngModel)]="foo">',
  '<input type="text" [name]="foo + \'bar\'">',
  '<input type="text" [name]="foo | bar">',
  '<div>{{ content }}</div>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if interpolation is used as attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}">
                                 ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if interpolation is used as part of attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}bar">
                                 ~~~~~~~~~~~~
      `,
    messageId,
  }),
];
