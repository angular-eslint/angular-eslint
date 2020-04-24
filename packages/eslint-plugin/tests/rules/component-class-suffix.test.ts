import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/component-class-suffix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'componentClassSuffix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      selector: 'sg-foo-bar',
      template: '<foo-bar [foo]="bar">{{baz + 42}}</foo-bar>'
    })
    class TestComponent {}
`,
    `
    @Directive({
      selector: '[myHighlight]'
    })
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
        @Component({
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
        @Component({
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
      description:
        'it should fail when component class is with the wrong suffix',
      annotatedSource: `
        @Component({
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
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
      messageId,
      options: [
        {
          suffixes: ['Component', 'View'],
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a different list of suffixes is set and doesn't match`,
      annotatedSource: `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
      messageId,
      options: [
        {
          suffixes: ['Component'],
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a different list of suffixes is set and doesn't match`,
      annotatedSource: `
        @Component({
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
