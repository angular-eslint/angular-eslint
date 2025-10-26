import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/alt-text';

const messageId: MessageIds = 'altText';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<img src="foo" alt="Foo eating a sandwich.">',
  '<IMG src="foo" alt="Foo eating a sandwich.">',
  '<img src="foo" [attr.alt]="altText">',
  `<img src="foo" [attr.alt]="'Alt Text'">`,
  '<img src="foo" alt="">',
  '<object aria-label="foo">',
  '<OBJECT aria-label="foo">',
  '<object aria-labelledby="id1">',
  '<object>Meaningful description</object>',
  '<object title="An object">',
  '<object aria-label="foo" id="bar"></object>',
  '<area aria-label="foo" />',
  '<AREA aria-label="foo" />',
  '<area aria-labelledby="id1" />',
  '<area alt="This is descriptive!" />',
  '<area alt="desc" href="path">',
  '<input type="text">',
  '<input type="image" alt="This is descriptive!">',
  '<INPUT type="image" alt="This is descriptive!">',
  '<input type="image" aria-label="foo">',
  '<input type="image" aria-labelledby="id1">',
  '<object [title]="title" [other]="val"></object>',
  '<object [attr.aria-label]="desc" [custom]="x"></object>',
  '<area [alt]="altText" [id]="itemId">',
  '<area [attr.aria-label]="label" [prop]="p">',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
    description: 'should fail when an all-caps object does not have alt text or labels',
    annotatedSource: `
        <OBJECT></OBJECT>
        ~~~~~~~~~~~~~~~~~
      `,
    data: { element: 'OBJECT' },
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
