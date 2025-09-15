import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-at-else';

const messageId: MessageIds = 'preferAtElse';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `@if (a) {}`,
  `
    @if (a) {
    } @else {
    }
  `,
  `
    @if (a) {}
    @if (b) {}
  `,
  `
    @if (a) {}
    @if (!b) {}
  `,
  `
    @if (a.b) {}
    @if (!c.b) {}
  `,
  `
    @if (a === true) {}
    @if (a === false) {}
  `,
  `
    @if (a === b) {}
    @if (a != b) {}
  `,
  `
    @if (a > 0) {}
    @if (a < 0) {}
  `,
  `
    @if (a > 1) {}
    @if (a <= 0) {}
  `,
  `
    @if (a >= b) {}
    @if (a <= b) {}
  `,
  `
    @if (a.length > 1) {}
    @if (a.length <= 0) {}
  `,
  `
    @if (a) {}
    text
    @if (!a) {}
  `,
  `
    @if (a) {}
    <element/>
    @if (!a) {}
  `,
  `
    @if (a) {}
    @if (b) {}
    @if (!a) {}
  `,
  `
    @if (a) {}
    @else if (b) {}
    @if (!a) {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  ...[
    ['a', '!a'],
    ['a > b', 'a <= b'],
    ['a >= b', 'a < b'],
    ['a === b', 'a !== b'],
    ['a == b', 'a != b'],
    ['a.length > 0', 'a.length === 0'],
    ['0 < a.length', 'a.length === 0'],
    ['0 < a.length', '0 === a.length'],
    ['a.length > 0', '0 === a.length'],
    ['a.length > 0', 'a.length == 0'],
  ].flatMap(
    ([firstCondition, secondCondition]): InvalidTestCase<
      MessageIds,
      Options
    >[] => [
      convertAnnotatedSourceToFailureCase({
        description: `fails for '${firstCondition}' and '${secondCondition}'`,
        annotatedSource: `
          @if (${firstCondition}) {}
          @if (${secondCondition}) {}
          ~~~~
        `,
        messageId,
        annotatedOutput: `
          @if (${firstCondition}) {}
          @else {}
          
        `,
      }),
      convertAnnotatedSourceToFailureCase({
        description: `fails for '${secondCondition}' and '${firstCondition}'`,
        annotatedSource: `
          @if (${secondCondition}) {}
          @if (${firstCondition}) {}
          ~~~~
        `,
        messageId,
        annotatedOutput: `
          @if (${secondCondition}) {}
          @else {}
          
        `,
      }),
    ],
  ),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if that can be merged into existing @else`,
    annotatedSource: `
      @if (a) {
        1
      } @else {
        2
      }
      @if (!a) {
      ~~~~
        3
      }
    `,
    messageId,
    annotatedOutput: `
      @if (a) {
        1
      } @else {
        2
      
      
        3
      }
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if with @else that can be merged into existing @if`,
    annotatedSource: `
      @if (a) {
        1
      }
      @if (!a) {
      ~~~~
        2
      } @else {
        3
      }
    `,
    messageId,
    annotatedOutput: `
      @if (a) {
        1
      
        3
      }
      @else {
      
        2
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if when separated from the first @if by whitespace`,
    annotatedSource: `
      @if (a) {}
      
      @if (!a) {}
      ~~~~
    `,
    messageId,
    annotatedOutput: `
      @if (a) {}
      
      @else {}
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    // The HTML-encoded whitespace is actually stripped out by the
    // parser, so this can be fixed without changing how the template
    // is rendered. Even the `&nbsp;` before the `@else` is OK.
    description: `fails for second @if when separated from the first @if by HTML-encoded whitespace`,
    annotatedSource: `
      @if (a) {}
      &nbsp;
      @if (!a) {}
      ~~~~
    `,
    messageId,
    annotatedOutput: `
      @if (a) {}
      &nbsp;
      @else {}
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if when separated from the first @if by comment`,
    annotatedSource: `
      @if (a) {}
      <!-- comment -->
      @if (!a) {}
      ~~~~
    `,
    messageId,
    annotatedOutput: `
      @if (a) {}
      <!-- comment -->
      @else {}
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if when first @if has alias`,
    annotatedSource: `
      @if (a; as alias) {}
      @if (!a) {}
      ~~~~
    `,
    messageId,
    annotatedOutput: `
      @if (a; as alias) {}
      @else {}
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails for second @if but does not provide fix when second @if has alias`,
    annotatedSource: `
      @if (a) {}
      @if (!a; as alias) {}
      ~~~~
    `,
    messageId,
  }),
];
