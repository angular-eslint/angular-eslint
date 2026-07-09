import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-outerhtml';

const messageId: MessageIds = 'noOuterHtml';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // The recommended alternative.
  `<div [innerHTML]="html"></div>`,
  // `outerHTML` is a DOM property, so a binding to a *component* input that
  // happens to be named `outerHTML` is not the DOM footgun and is left alone.
  `<my-component [outerHTML]="html"></my-component>`,
  // Unrelated bindings.
  `<img [src]="url" />`,
  `<div [class.active]="isActive"></div>`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when binding to `[outerHTML]`',
    annotatedSource: `
      <div [outerHTML]="html"></div>
            ~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when binding to `outerHTML` with `bind-` syntax',
    annotatedSource: `
      <p bind-outerHTML="html">lib works!</p>
              ~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for a static `outerHTML` attribute',
    annotatedSource: `
      <div outerHTML="static"></div>
           ~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for `[outerHTML]` on a nested element inside control flow',
    annotatedSource: `
      @if (condition) {
        <span [outerHTML]="html"></span>
               ~~~~~~~~~
      }
    `,
    messageId,
  }),
];
