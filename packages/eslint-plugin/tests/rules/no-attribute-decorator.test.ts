import rule, { RULE_NAME } from '../../src/rules/no-attribute-decorator';
import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId = 'noAttributeDecorator';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should pass if constructor does not exist
    `
      class Test {
        public foo(){}
      }
    `,
    // should pass if constructor exists but no parameter
    `
      class Test {
        constructor() {}
      }
    `,
    // should pass if constructor exists and have one parameter without decorator
    `
      class Test {
        constructor(foo: any) {}
      }
    `,
    // should pass if constructor exists and have one parameter with decorator
    `
      class Test {
        constructor(@Optional() foo: any) {}
      }
    `,
    // // should pass if constructor exists and have multiple parameters without decorator
    `
      class Test {
        constructor(foo: any, @Optional() bar: any) {}
      }
    `,
    // // should pass if constructor exists and have multiple parameters with decorator
    `
      class Test {
        constructor(@Optional() foo: any, @Optional() bar: any) {}
      }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if constructor has one parameter with @Attribute decorator',
      annotatedSource: `
      class Test {
        constructor(@Attribute() foo: any) {}
                                 ~~~~~~~~
      }
    `,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if constructor has one parameter with @Attribute decorator',
      annotatedSource: `
      class Test {
        constructor(@Attribute("name") foo: any) {}
                                       ~~~~~~~~
      }
    `,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if constructor has multiple parameters but one with @Attribute decorator',
      annotatedSource: `
      class Test {
        constructor(foo: any, @Attribute() bar: any) {}
                                           ~~~~~~~~
      }
    `,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if constructor has multiple parameters but one with @Attribute decorator',
      annotatedSource: `
      class Test {
        constructor(@Optional() foo: any, @Attribute() bar: any) {}
                                                       ~~~~~~~~
      }
    `,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: `should fail if constructor has multiple parameters
      and all with @Attribute decorator`,
      annotatedSource: `
      class Test {
        constructor(@Attribute() foo: any, @Attribute() bar: any) {}
                                 ~~~~~~~~               ^^^^^^^^
      }
    `,
      messages: [
        {
          char: '~',
          messageId: messageId,
        },
        {
          char: '^',
          messageId: messageId,
        },
      ],
    }),
  ],
});
