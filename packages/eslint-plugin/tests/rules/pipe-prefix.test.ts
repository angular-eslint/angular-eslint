import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { MessageIds, RULE_NAME } from '../../src/rules/pipe-prefix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'pipePrefix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      // should not fail when @Pipe not invoked
      code: `
        @Pipe
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
    {
      // should not fail when @Pipe does not have content
      code: `
        @Pipe({})
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
    {
      // should ignore the rule when the name is a variable
      code: `
        export function mockPipe(name: string): any {
          @Pipe({ name })
          class MockPipe implements PipeTransform {
            transform(input: any): any {
              return input;
            }
          }
          return MockPipe;
        }
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
    {
      // should ignore the rule when the rule option is blank
      code: `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `,
      options: [
        {
          prefixes: [],
        },
      ],
    },
    {
      // should succeed with prefix ng in @Pipe
      code: `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
    {
      // should succeed with multiple prefixes in @Pipe
      code: `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng', 'sg', 'mg'],
        },
      ],
    },
    {
      // should succeed with multiple prefixes in @Pipe
      code: `
        @Pipe({
          name: \`ngBarFoo\`
        })
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng', 'sg', 'mg'],
        },
      ],
    },
    {
      // should succeed when the class is not a Pipe
      code: `
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
    {
      // should do nothing if the name of the pipe is not a literal
      code: `
        const pipeName = 'fooBar';
        @Pipe({
          name: pipeName
        })
        class Test {}
      `,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when Pipe has no prefix ng',
      annotatedSource: `
        @Pipe({
          name: 'foo-bar'
                ~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
      options: [
        {
          prefixes: ['ng'],
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when Pipe has no prefix applying multiple prefixes',
      annotatedSource: `
        @Pipe({
          name: 'foo-bar'
                ~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
      options: [
        {
          prefixes: ['ng', 'mg', 'sg'],
        },
      ],
    }),
  ],
});
