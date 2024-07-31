import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-conflicting-lifecycle';

const interfaceMessageId: MessageIds = 'noConflictingLifecycleInterface';
const methodMessageId = 'noConflictingLifecycleMethod';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // should pass if implements DoCheck, but not OnChanges
  `
      class Test implements DoCheck {}
    `,
  // should pass if contains ngDoCheck method, but not ngOnChanges
  `
      class Test {
        ngDoCheck() {}
      }
    `,
  // should pass if implements DoCheck and contains ngDoCheck method, but does not implement OnChanges and does not contain ngOnChanges method
  `
      class Test implements DoCheck {
        ngDoCheck() {}
      }
    `,
  // should pass if implements OnChanges, but not DoCheck
  `
      class Test implements OnChanges {}
    `,
  // should pass if contains ngOnChanges method, but not ngDoCheck
  `
      class Test {
        ngOnChanges() {}
      }
    `,
  // should pass if implements OnChanges and contains ngOnChanges method, but does not implement DoCheck and does not contain ngDoCheck method
  `
      class Test implements OnChanges {
        ngOnChanges() {}
      }
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if implement DoCheck and OnChanges`,
    annotatedSource: `
        class Test implements DoCheck, OnChanges, run {
                              ~~~~~~~  ^^^^^^^^^
          test() {}
          test1() {}
        }
      `,
    messages: [
      {
        char: '~',
        messageId: interfaceMessageId,
      },
      {
        char: '^',
        messageId: interfaceMessageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if implement DoCheck and OnChanges and contain the ngDoCheck and ngOnChanges methods`,
    annotatedSource: `
        class Test implements DoCheck, OnChanges {
                              ~~~~~~~  ^^^^^^^^^
          ngDoCheck() {}
          ##############
          ngOnChanges() {}
          ****************
        }
      `,
    messages: [
      {
        char: '~',
        messageId: interfaceMessageId,
      },
      {
        char: '^',
        messageId: interfaceMessageId,
      },
      {
        char: '#',
        messageId: methodMessageId,
      },
      {
        char: '*',
        messageId: methodMessageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if the ngDoCheck and ngOnChanges methods exist`,
    annotatedSource: `
        class Test {
          ngDoCheck() {}
          ~~~~~~~~~~~~~~
          ngOnChanges() {}
          ^^^^^^^^^^^^^^^^
        }
      `,
    messages: [
      {
        char: '~',
        messageId: methodMessageId,
      },
      {
        char: '^',
        messageId: methodMessageId,
      },
    ],
  }),
];
