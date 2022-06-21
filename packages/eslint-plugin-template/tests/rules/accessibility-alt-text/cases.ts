import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/accessibility-alt-text';

const messageId: MessageIds = 'accessibilityAltText';

export const valid = [
  '<img src="foo" alt="Foo eating a sandwich.">',
  '<img src="foo" [attr.alt]="altText">',
  `<img src="foo" [attr.alt]="'Alt Text'">`,
  '<img src="foo" alt="">',
  '<object aria-label="foo">',
  '<object aria-labelledby="id1">',
  '<object>Meaningful description</object>',
  '<object title="An object">',
  '<area aria-label="foo" />',
  '<area aria-labelledby="id1" />',
  '<area alt="This is descriptive!" />',
  '<input type="text">',
  '<input type="image" alt="This is descriptive!">',
  '<input type="image" aria-label="foo">',
  '<input type="image" aria-labelledby="id1">',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail image does not have alt text',
    annotatedSource: `
        <ng-template>
          <div>
            <img src="foo">
            ~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'img' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when object does not have alt text or labels',
    annotatedSource: `
        <object></object>
        ~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'object' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail when area does not have alt or label text',
    annotatedSource: `
        <area />
        ~~~~~~~~
      `,
    data: { element: 'area' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with type image attribute does not have alt or text image',
    annotatedSource: `
        <input type="image">
        ~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail when input element with type image binding does not have alt or text image',
    annotatedSource: `
        <input [type]="'image'">
        ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'input' },
  }),
];
