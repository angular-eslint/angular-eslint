import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/directive-class-suffix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'directiveClassSuffix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestDirective {}
`,
    `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestValidator implements Validator {}
`,
    `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestValidator implements AsyncValidator {}
`,
    `
    @Directive
    class TestDirective {}
`,
    `
    @Pipe({
      selector: 'sg-test-pipe'
    })
    class TestPipe {}
`,
    `
    @Injectable()
    class TestService {}
`,
    `
    class TestEmpty {}
`,
    {
      code: `
        @Directive({
            selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
      options: [
        {
          suffixes: ['Page'],
        },
      ],
    },
    {
      code: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
      options: [
        {
          suffixes: ['Page', 'View'],
        },
      ],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when directive class has the wrong suffix',
      annotatedSource: `
        @Directive({
          selector: 'sg-foo-bar'
        })
        class Test {}
              ~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a different list of suffixes is set and doesn't match`,
      annotatedSource: `
        @Directive({
            selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
      messageId,
      options: [
        {
          suffixes: ['Directive', 'View'],
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a different list of suffixes is set and doesn't match`,
      annotatedSource: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
      messageId,
      options: [
        {
          suffixes: ['Directive'],
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a different list of suffixes is set and doesn't match`,
      annotatedSource: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
              ~~~~~~~~~~~~~
      `,
      messageId,
      options: [
        {
          suffixes: ['Page'],
        },
      ],
    }),
  ],
});
