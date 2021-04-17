import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/directive-class-suffix';
import rule, { RULE_NAME } from '../../src/rules/directive-class-suffix';

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
    class Test {}
    `,
    // https://github.com/angular-eslint/angular-eslint/issues/353
    `
    @Directive()
    class Test {}
    `,
    `
    @Component({
      selector: 'sg-bar-foo'
    })
    class TestComponent {}
    `,
    `
    @Pipe({
      name: 'sgPipe'
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
        class TestDir {}
      `,
      options: [{ suffixes: ['Dir'] }],
    },
    {
      code: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
      options: [{ suffixes: ['Page', 'View'] }],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if directive class name does not end with the default suffix',
      annotatedSource: `
        @Directive({
          selector: 'sg-foo-bar'
        })
        class Test {}
              ~~~~
      `,
      messageId,
      data: { className: 'Test', suffixes: ['"Directive"'] },
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if directive class name does not end with one of the default suffixes',
      annotatedSource: `
        @Directive({
          selector: 'sg-foo-bar'
        })
        class TestDirectivePage implements AsyncValidator {}
              ~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: {
        className: 'TestDirectivePage',
        suffixes: ['"Directive"', '"Validator"'].join(' or '),
      },
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if directive class name does not end with the custom suffix',
      annotatedSource: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPageDirective {}
              ~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: { className: 'TestPageDirective', suffixes: ['"Page"'] },
      options: [{ suffixes: ['Page'] }],
    }),
  ],
});
