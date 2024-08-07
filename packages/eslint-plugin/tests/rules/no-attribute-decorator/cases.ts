import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-attribute-decorator';

const messageId: MessageIds = 'noAttributeDecorator';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // should pass if constructor does not exist
  `
    class Test {
      foo() {}
    }
    `,
  // should pass if the constructor has no parameter properties
  `
    class Test {
      constructor() {}
    }
    `,
  // should pass if the constructor exists, but none of the parameter properties are decorated with `@ Attribute`
  `
    class Test {
      constructor(@Optional() foo: string, @Optional() bar: string, baz: number) {}
    }
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a parameter property is decorated with `@Attribute`',
    annotatedSource: `
        class Test {
          constructor(@Attribute() foo: string) {}
                      ~~~~~~~~~~~~
        }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if multiple parameter properties are decorated with `@Attribute`',
    annotatedSource: `
        class Test {
          constructor(
            @Inject(TOKEN) token: string,
            randomNumber: number,
            @Attribute() foo: string,
            ~~~~~~~~~~~~
            @Attribute('baz') bar: string
            ^^^^^^^^^^^^^^^^^
          ) {}
        }
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
];
