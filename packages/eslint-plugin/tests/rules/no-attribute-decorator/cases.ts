import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-attribute-decorator';

const messageId: MessageIds = 'noAttributeDecorator';

export const valid = [
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

export const invalid = [
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
