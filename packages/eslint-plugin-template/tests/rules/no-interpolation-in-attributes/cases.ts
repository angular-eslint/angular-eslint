import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import { MESSAGE_ID } from '../../../src/rules/no-interpolation-in-attributes';

const messageId = MESSAGE_ID;

export const valid = [
  '<input type="text" [name]="foo">',
  '<input type="text" name="foo" [(ngModel)]="foo">',
  '<input type="text" [name]="foo + \'bar\'">',
  '<input type="text" [name]="foo | bar">',
  '<div>{{ content }}</div>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if interpolation is used as attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}">
                                 ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <input type="text" name="{{ foo }}">
                                 ~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if interpolation is used as part of attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}bar">
                                 ~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <input type="text" name="{{ foo }}bar">
                                 ~~~~~~~~~~~~
      `,
  }),
];
